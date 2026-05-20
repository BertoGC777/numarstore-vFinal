import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createPayment, getPaymentById, updatePaymentStatus, getPaymentsByOrderId } from "../services/payment.service";
import Stripe from "stripe";
import { getDatabase } from "../db";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";
const STORE_NAME = process.env.LOJA_NOME || "Numar Store";

router.post("/create-checkout-session", authMiddleware, async (req: any, res) => {
  try {
    await getDatabase();
    const { items, shipping = 0, discount = 0, orderId, metadata = {} } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: "Carrinho vazio" });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        product_data: { name: `${item.name} (${item.color}, ${item.size})` },
        unit_amount: Math.round(item.pricePix * 100),
      },
      quantity: item.quantity,
    }));

    if (shipping > 0) {
      lineItems.push({
        price_data: { currency: "brl", product_data: { name: "Frete" }, unit_amount: Math.round(shipping * 100) },
        quantity: 1,
      });
    }

    let discounts: any[] | undefined;
    if (discount > 0) {
      const coupons = await stripe.coupons.list({ limit: 10 });
      const existing = coupons.data.find((c: any) => c.percent_off === discount && c.duration === "once");
      discounts = existing?.id ? [{ coupon: existing.id }] : [{ coupon: (await stripe.coupons.create({ percent_off: discount, duration: "once", name: `PIX ${discount}%` })).id }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      billing_address_collection: "required",
      customer_email: metadata.email || undefined,
      client_reference_id: metadata.userId,
      line_items: lineItems,
      discounts,
      mode: "payment",
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
      metadata: { userId: metadata.userId || "", orderId, store: STORE_NAME },
    });

    const { dbRun: run } = await import("../db");
    run("UPDATE orders SET stripe_payment_intent_id = ? WHERE id = ?", [session.id, orderId]);

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao criar sessão Stripe" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const paymentId = await createPayment(req.body);
    res.json({ paymentId, status: "pending" });
  } catch {
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

router.get("/:id/status", authMiddleware, async (req, res) => {
   try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
     const payment = await getPaymentById(id);
    if (!payment) return res.status(404).json({ error: "Pagamento não encontrado" });
    res.json({ status: payment.status });
  } catch {
    res.status(500).json({ error: "Erro ao buscar status" });
  }
});

router.post("/:id/confirm", authMiddleware, async (req, res) => {
   try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
     await updatePaymentStatus(id, "paid");
    res.json({ status: "paid" });
  } catch {
    res.status(500).json({ error: "Erro ao confirmar pagamento" });
  }
});

router.post("/webhook", async (req: any, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !sig) return res.status(500).json({ error: "Webhook secret não configurado" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const { id: orderId } = (event.data.object as any)?.metadata || {};
  if (!orderId) return res.json({ received: true });

  const statusMap: Record<string, { status: string; stripeStatus: string }> = {
    "checkout.session.completed": { status: "paid", stripeStatus: "paid" },
    "payment_intent.succeeded": { status: "paid", stripeStatus: "paid" },
    "payment_intent.payment_failed": { status: "cancelled", stripeStatus: "failed" },
    "charge.refunded": { status: "cancelled", stripeStatus: "refunded" },
  };

  const update = statusMap[event.type];
  if (update) {
    await getDatabase();
    const { dbRun: run } = await import("../db");
    run("UPDATE orders SET status = ?, stripe_status = ? WHERE id = ?", [update.status, update.stripeStatus, orderId]);
  }

  res.json({ received: true });
});

export default router;
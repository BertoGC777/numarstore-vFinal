import Stripe from "stripe";
import { Request, Response } from "express";
import { getDatabase, dbRun, dbGet } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const FRONTEND_URL = process.env.FRONTEND_URL || "https://numarstore-v-final.vercel.app";
const STORE_NAME = process.env.LOJA_NOME || "Numar Store";

export async function stripeCheckout(req: Request, res: Response) {
  try {
    const items = req.body.items as Array<{
      name: string; pricePix: number; color: string; size: string; quantity: number;
    }>;
    const shipping = req.body.shipping as number;
    const discount = req.body.discount as number;
    const metadata = req.body.metadata as Record<string, string> || {};

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: { name: `${item.name} (${item.color}, ${item.size})` },
        unit_amount: Math.round(item.pricePix * 100),
      },
      quantity: item.quantity,
    }));

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: { name: "Frete" },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    let discounts: any[] | undefined;
    if (discount > 0) {
      const coupon = await getOrCreateCoupon(stripe, discount);
      discounts = [{ coupon }];
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
      metadata: {
        userId: metadata.userId || "",
        orderId: metadata.orderId || "",
        store: STORE_NAME,
      },
    });

    await getDatabase();
    dbRun("UPDATE orders SET stripe_payment_intent_id = ? WHERE id = ?", [session.id, metadata.orderId]);

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao criar sessão Stripe" });
  }
}

export async function stripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return res.status(500).json({ error: "Webhook secret não configurado" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig!, webhookSecret);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const orderId = (event.data.object as any)?.metadata?.orderId;
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
    dbRun("UPDATE orders SET status = ?, stripe_status = ? WHERE id = ?", [update.status, update.stripeStatus, orderId]);
  }

  res.json({ received: true });
}

export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { amount, orderId, userId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "brl",
      metadata: { orderId, userId },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao criar PaymentIntent" });
  }
}

async function getOrCreateCoupon(stripe: Stripe, discountPercent: number): Promise<string> {
  const coupons = await stripe.coupons.list({ limit: 10 });

  const existing = coupons.data.find(
    (c) => c.percent_off === discountPercent && c.duration === "once"
  );
  if (existing?.id) return existing.id;

  const coupon = await stripe.coupons.create({
    percent_off: discountPercent,
    duration: "once",
    name: `Desconto PIX ${discountPercent}%`,
  });
  return coupon.id;
}
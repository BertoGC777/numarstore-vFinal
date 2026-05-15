import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createOrder, getUserOrders, getOrderById } from "../services/order.service";

const router = Router();

router.post("/", async (req: any, res) => {
  try {
    const userId = req.user?.id || null;
    console.log("📦 Criando pedido - userId:", userId, "body:", JSON.stringify(req.body, null, 2));
    res.status(201).json({ id: await createOrder(userId, req.body) });
  } catch (e: any) {
    console.error("❌ Erro ao criar pedido:", JSON.stringify(e, null, 2));
    res.status(500).json({ error: e.message || "Erro ao criar pedido" });
  }
});

router.get("/", authMiddleware, async (req: any, res) => {
  try {
    res.json(await getUserOrders(req.user.id));
  } catch { res.status(500).json({ error: "Erro ao buscar pedidos" }); }
});

router.get("/:id", authMiddleware, async (req: any, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(order);
  } catch { res.status(500).json({ error: "Erro ao buscar pedido" }); }
});

export default router;
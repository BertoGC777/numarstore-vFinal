import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getCartByUser, addToCart, updateCartItem, removeFromCart, clearCart, getCartTotal } from "../services/cart.service";

const router = Router();

router.get("/", async (req: any, res) => {
  try {
    const userId = req.user?.id || null;
    res.json({ items: await getCartByUser(userId), total: await getCartTotal(userId) });
  } catch { res.status(500).json({ error: "Erro ao buscar carrinho" }); }
});

router.post("/", async (req: any, res) => {
  try {
    const { productId, color, size, quantity } = req.body;
    const userId = req.user?.id || null;
    await addToCart(userId, productId, color, size, quantity || 1);
    res.json({ items: await getCartByUser(userId), total: await getCartTotal(userId) });
  } catch { res.status(500).json({ error: "Erro ao adicionar ao carrinho" }); }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user?.id || null;
    await updateCartItem(Number(req.params.id), req.body.quantity);
    res.json({ items: await getCartByUser(userId), total: await getCartTotal(userId) });
  } catch { res.status(500).json({ error: "Erro ao atualizar carrinho" }); }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user?.id || null;
    await removeFromCart(Number(req.params.id));
    res.json({ items: await getCartByUser(userId), total: await getCartTotal(userId) });
  } catch { res.status(500).json({ error: "Erro ao remover item" }); }
});

router.delete("/clear", async (req: any, res) => {
  try {
    const userId = req.user?.id || null;
    await clearCart(userId);
    res.json({ items: [], total: 0 });
  } catch { res.status(500).json({ error: "Erro ao limpar carrinho" }); }
});

router.get("/total", async (req: any, res) => {
  try {
    const userId = req.user?.id || null;
    res.json({ total: await getCartTotal(userId) });
  } catch { res.status(500).json({ error: "Erro ao calcular total" }); }
});

export default router;
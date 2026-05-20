import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createCoupon,
  getAllCoupons,
  getCouponByCode,
  validateCoupon,
  calculateDiscount,
  incrementCouponUsage,
  updateCoupon,
  deleteCoupon,
} from "../services/coupon.service";

const router = Router();

// Public: Validate coupon
router.post("/validate", async (req, res) => {
  try {
    const { code, subtotal, productIds, category } = req.body;
    
    if (!code || subtotal === undefined) {
      return res.status(400).json({ error: "Código e subtotal são obrigatórios" });
    }

    const result = await validateCoupon(code, subtotal, productIds, category);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao validar cupom" });
  }
});

// Admin: Create coupon
router.post("/", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const coupon = await createCoupon(req.body);
    res.json(coupon);
  } catch (e: any) {
    if (e.message === 'DUPLICATE_CODE') {
      return res.status(409).json({ error: "Código de cupom já existe" });
    }
    res.status(500).json({ error: e.message || "Erro ao criar cupom" });
  }
});

// Admin: Get all coupons
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const coupons = await getAllCoupons();
    res.json(coupons);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao buscar cupons" });
  }
});

// Admin: Update coupon
router.put("/:id", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const coupon = await updateCoupon(req.params.id, req.body);
    if (!coupon) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }
    res.json(coupon);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao atualizar cupom" });
  }
});

// Admin: Delete coupon
router.delete("/:id", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const success = await deleteCoupon(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }
    res.json({ message: "Cupom deletado com sucesso" });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao deletar cupom" });
  }
});

export default router;

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createReview,
  getReviewsByProductId,
  getProductRating,
  approveReview,
  deleteReview,
  markHelpful,
  getAllReviews,
} from "../services/review.service";

const router = Router();

// Public: Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsByProductId(productId);
    const rating = await getProductRating(productId);
    res.json({ reviews, rating });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao buscar reviews" });
  }
});

// Public: Get product rating only
router.get("/rating/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const rating = await getProductRating(productId);
    res.json(rating);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao buscar rating" });
  }
});

// Authenticated: Create review
router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const review = await createReview({
      ...req.body,
      user_id: req.user.id,
    });
    res.json(review);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao criar review" });
  }
});

// Public: Mark review as helpful
router.post("/:id/helpful", async (req, res) => {
  try {
    const success = await markHelpful(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Review não encontrada" });
    }
    res.json({ message: "Review marcada como útil" });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao marcar review" });
  }
});

// Admin: Get all reviews
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const reviews = await getAllReviews(false);
    res.json(reviews);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao buscar reviews" });
  }
});

// Admin: Approve review
router.put("/:id/approve", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const success = await approveReview(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Review não encontrada" });
    }
    res.json({ message: "Review aprovada" });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao aprovar review" });
  }
});

// Admin: Delete review
router.delete("/:id", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const success = await deleteReview(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Review não encontrada" });
    }
    res.json({ message: "Review deletada" });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Erro ao deletar review" });
  }
});

export default router;

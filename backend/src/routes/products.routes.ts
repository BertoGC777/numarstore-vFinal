import { Router } from "express";
import { getAllProducts, getProductBySlug, searchProducts, getRelatedProducts, checkStock } from "../services/product.service";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.sub) filters.subcategory = req.query.sub as string;
    if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
    if (req.query.sort) filters.sort = req.query.sort as any;
    if (req.query.q) filters.search = req.query.q as string;
    if (req.query.new === "1" || req.query.new === "true") filters.isNew = true;
    if (req.query.sale === "1" || req.query.sale === "true") filters.isSale = true;
    res.json(await getAllProducts(filters));
  } catch { res.status(500).json({ error: "Erro ao buscar produtos" }); }
});

// Busca textual ANTES de :slug para não ser engolida
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q as string;
    res.json(q ? await searchProducts(q) : []);
  } catch (err: any) {
    console.error("Search error:", err.message || err);
    res.status(500).json({ error: "Erro na busca", details: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(product);
  } catch (err: any) {
    console.error("Product detail error:", err.message || err);
    res.status(500).json({ error: "Erro ao buscar produto", details: err.message });
  }
});

router.get("/:slug/related", async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(await getRelatedProducts(product.id, product.category || ""));
  } catch (err: any) {
    console.error("Related products error:", err.message || err);
    res.status(500).json({ error: "Erro ao buscar produtos relacionados", details: err.message });
  }
});

router.get("/:slug/stock", async (req, res) => {
  try {
    res.json({ inStock: await checkStock(req.params.slug) });
  } catch (err: any) {
    console.error("Stock check error:", err.message || err);
    res.status(500).json({ error: "Erro ao verificar estoque", details: err.message });
  }
});

export default router;
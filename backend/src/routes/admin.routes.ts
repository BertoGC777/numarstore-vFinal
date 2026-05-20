import { Router } from "express";
import { adminMiddleware } from "../middleware/auth";
import * as adminService from "../services/admin.service";

const router = Router();

// Dashboard
router.get("/dashboard", adminMiddleware, async (req, res) => {
  try {
    const data = await adminService.getDashboard();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar dashboard" });
  }
});

// Analytics
router.get("/analytics", adminMiddleware, async (req, res) => {
  try {
    const period = (req.query.period as string) || "7d";
    const data = await adminService.getAnalytics(period);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar analytics" });
  }
});

// Orders - Get all with filters and pagination
router.get("/orders", adminMiddleware, async (req, res) => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const data = await adminService.getOrders({ status, search, page, limit });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar pedidos" });
  }
});

// Orders - Get by ID
router.get("/orders/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await adminService.getOrderById(id);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar pedido" });
  }
});

// Orders - Update status
router.put("/orders/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status é obrigatório" });
    
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await adminService.updateOrderStatus(id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar status" });
  }
});

// Products - Get all with filters and pagination
router.get("/products", adminMiddleware, async (req, res) => {
  try {
    const category = req.query.category as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    
    const data = await adminService.getProducts({ category, search, page, limit });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar produtos" });
  }
});

// Products - Get by ID
router.get("/products/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await adminService.getProductById(id);
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar produto" });
  }
});

// Products - Create
router.post("/products", adminMiddleware, async (req, res) => {
  try {
    const product = await adminService.createProduct(req.body);
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao criar produto" });
  }
});

// Products - Update
router.put("/products/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await adminService.updateProduct(id, req.body);
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar produto" });
  }
});

// Products - Delete
router.delete("/products/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await adminService.deleteProduct(id);
    res.json({ message: "Produto excluído com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao excluir produto" });
  }
});

// Products - Add images
router.post("/products/:id/images", adminMiddleware, async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: "Imagens são obrigatórias" });
    }
    
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await adminService.addProductImages(id, images);
    res.json({ message: "Imagens adicionadas com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao adicionar imagens" });
  }
});

// Products - Remove image
router.delete("/products/:id/images/:imageId", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const imageId = Array.isArray(req.params.imageId) ? req.params.imageId[0] : req.params.imageId;
    await adminService.removeProductImage(id, imageId);
    res.json({ message: "Imagem removida com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao remover imagem" });
  }
});

// Products - Update stock
router.put("/products/:id/stock", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { stock } = req.body;
    await adminService.updateProductStock(id, stock);
    res.json({ message: "Estoque atualizado com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar estoque" });
  }
});

// Products - Get stock
router.get("/products/:id/stock", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stock = await adminService.getProductStock(id);
    res.json(stock);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar estoque" });
  }
});

export default router;

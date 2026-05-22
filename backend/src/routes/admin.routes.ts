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
    console.log("=== PUT /admin/products/:id ===");
    console.log("Product ID:", id);
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User:", req.user);
    
    const product = await adminService.updateProduct(id, req.body);
    console.log("Product updated successfully:", product.id);
    res.json(product);
  } catch (err: any) {
    console.error("Error updating product:", err);
    console.error("Error stack:", err.stack);
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

// Customers - Get all with filters and pagination
router.get("/customers", adminMiddleware, async (req, res) => {
  try {
    const search = req.query.search as string;
    const role = req.query.role as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const data = await adminService.getCustomers({ search, role, page, limit });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar clientes" });
  }
});

// Customers - Get by ID
router.get("/customers/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const customer = await adminService.getCustomerById(id);
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar cliente" });
  }
});

// Customers - Update
router.put("/customers/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const customer = await adminService.updateCustomer(id, req.body);
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar cliente" });
  }
});

// Customers - Delete
router.delete("/customers/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await adminService.deleteCustomer(id);
    res.json({ message: "Cliente excluído com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao excluir cliente" });
  }
});

// Bundles/Combos - Get all with filters and pagination
router.get("/bundles", adminMiddleware, async (req, res) => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    
    const data = await adminService.getBundles({ search, page, limit });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar conjuntos" });
  }
});

// Bundles/Combos - Get by ID
router.get("/bundles/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bundle = await adminService.getBundleById(id);
    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar conjunto" });
  }
});

// Bundles/Combos - Create
router.post("/bundles", adminMiddleware, async (req, res) => {
  try {
    const bundle = await adminService.createBundle(req.body);
    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao criar conjunto" });
  }
});

// Bundles/Combos - Update
router.put("/bundles/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bundle = await adminService.updateBundle(id, req.body);
    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar conjunto" });
  }
});

// Bundles/Combos - Delete
router.delete("/bundles/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await adminService.deleteBundle(id);
    res.json({ message: "Conjunto excluído com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao excluir conjunto" });
  }
});

// Coupons - Get all with filters and pagination
router.get("/coupons", adminMiddleware, async (req, res) => {
  try {
    const search = req.query.search as string;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const data = await adminService.getCoupons({ search, status, page, limit });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar cupons" });
  }
});

// Coupons - Get by ID
router.get("/coupons/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const coupon = await adminService.getCouponById(id);
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar cupom" });
  }
});

// Coupons - Create
router.post("/coupons", adminMiddleware, async (req, res) => {
  try {
    const coupon = await adminService.createCoupon(req.body);
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao criar cupom" });
  }
});

// Coupons - Update
router.put("/coupons/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const coupon = await adminService.updateCoupon(id, req.body);
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar cupom" });
  }
});

// Coupons - Delete
router.delete("/coupons/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await adminService.deleteCoupon(id);
    res.json({ message: "Cupom excluído com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao excluir cupom" });
  }
});

// Categories - Get all
router.get("/categories", adminMiddleware, async (req, res) => {
  try {
    const categories = await adminService.getCategories();
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar categorias" });
  }
});

// Categories - Add
router.post("/categories", adminMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nome da categoria é obrigatório" });
    
    const category = await adminService.addCategory(name);
    res.json({ category });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao adicionar categoria" });
  }
});

// Categories - Delete
router.delete("/categories/:name", adminMiddleware, async (req, res) => {
  try {
    const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
    await adminService.deleteCategory(name);
    res.json({ message: "Categoria excluída com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao excluir categoria" });
  }
});

// Store Settings - Get
router.get("/settings", adminMiddleware, async (req, res) => {
  try {
    const settings = await adminService.getStoreSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar configurações" });
  }
});

// Store Settings - Update
router.put("/settings", adminMiddleware, async (req, res) => {
  try {
    const settings = await adminService.updateStoreSettings(req.body);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar configurações" });
  }
});

// Activity Logs - Get all with filters
router.get("/activity-logs", adminMiddleware, async (req, res) => {
  try {
    const user_id = req.query.user_id as string;
    const action = req.query.action as string;
    const entity_type = req.query.entity_type as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const data = await adminService.getActivityLogs({ user_id, action, entity_type, page, limit });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar logs de atividade" });
  }
});

// Low Stock - Get products with low stock
router.get("/low-stock", adminMiddleware, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 5;
    const products = await adminService.getLowStockProducts(threshold);
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar produtos com estoque baixo" });
  }
});

export default router;

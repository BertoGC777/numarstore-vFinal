import { Router } from "express";
import { adminMiddleware } from "../middleware/auth";
import { dbAll, dbGet, dbRun, getDatabase } from "../db";

const router = Router();

// Get all orders
router.get("/orders", adminMiddleware, async (req, res) => {
  try {
    await getDatabase();
    const orders = dbAll(`
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o 
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar pedidos" });
  }
});

// Get order by ID with items
router.get("/orders/:id", adminMiddleware, async (req, res) => {
  try {
    await getDatabase();
    const order = dbGet("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    
    const items = dbAll("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
    res.json({ ...order, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar pedido" });
  }
});

// Update order status
router.put("/orders/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status é obrigatório" });
    
    await getDatabase();
    dbRun("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    
    const updated = dbGet("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar status" });
  }
});

// Get all products
router.get("/products", adminMiddleware, async (req, res) => {
  try {
    await getDatabase();
    const products = dbAll("SELECT * FROM products ORDER BY created_at DESC");
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar produtos" });
  }
});

// Get product by ID
router.get("/products/:id", adminMiddleware, async (req, res) => {
  try {
    await getDatabase();
    const product = dbGet("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!product) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao buscar produto" });
  }
});

// Create product
router.post("/products", adminMiddleware, async (req, res) => {
  try {
    const { 
      name, 
      category, 
      description, 
      price_pix, 
      price_card, 
      colors, 
      sizes, 
      images, 
      is_new, 
      is_sale, 
      discount 
    } = req.body;

    if (!name || !category || !price_pix || !price_card) {
      return res.status(400).json({ error: "Nome, categoria, preço PIX e preço cartão são obrigatórios" });
    }

    await getDatabase();
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const id = crypto.randomUUID();
    const now = Date.now();

    // Insert product
    dbRun(
      `INSERT INTO products (id, slug, name, description, category, price_pix, price_card, is_new, is_sale, discount, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, slug, name, description || "", category, price_pix, price_card, is_new ? 1 : 0, is_sale ? 1 : 0, discount || 0, now]
    );

    // Insert colors
    if (colors && Array.isArray(colors)) {
      colors.forEach((color: { name: string; hex: string }) => {
        dbRun("INSERT INTO product_colors (product_id, name, hex) VALUES (?, ?, ?)", [id, color.name, color.hex]);
      });
    }

    // Insert sizes
    if (sizes && Array.isArray(sizes)) {
      sizes.forEach((size: string) => {
        dbRun("INSERT INTO product_sizes (product_id, size) VALUES (?, ?)", [id, size]);
      });
    }

    // Insert images
    if (images && Array.isArray(images)) {
      images.forEach((img: { url: string; color?: string; colorHex?: string }, index: number) => {
        dbRun(
          "INSERT INTO product_images (product_id, url, color, color_hex, sort_order) VALUES (?, ?, ?, ?, ?)",
          [id, img.url, img.color || null, img.colorHex || null, index]
        );
      });
    }

    const product = dbGet("SELECT * FROM products WHERE id = ?", [id]);
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao criar produto" });
  }
});

// Update product
router.put("/products/:id", adminMiddleware, async (req, res) => {
  try {
    const { 
      name, 
      category, 
      description, 
      price_pix, 
      price_card, 
      colors, 
      sizes, 
      images, 
      is_new, 
      is_sale, 
      discount 
    } = req.body;

    await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];
    
    if (name !== undefined) { 
      fields.push("name = ?"); 
      values.push(name);
      // Update slug if name changes
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      fields.push("slug = ?");
      values.push(slug);
    }
    if (category !== undefined) { fields.push("category = ?"); values.push(category); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (price_pix !== undefined) { fields.push("price_pix = ?"); values.push(price_pix); }
    if (price_card !== undefined) { fields.push("price_card = ?"); values.push(price_card); }
    if (is_new !== undefined) { fields.push("is_new = ?"); values.push(is_new ? 1 : 0); }
    if (is_sale !== undefined) { fields.push("is_sale = ?"); values.push(is_sale ? 1 : 0); }
    if (discount !== undefined) { fields.push("discount = ?"); values.push(discount); }
    
    if (fields.length === 0) return res.status(400).json({ error: "Nenhum campo para atualizar" });
    
    dbRun(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, [...values, req.params.id]);

    // Update colors if provided
    if (colors !== undefined) {
      dbRun("DELETE FROM product_colors WHERE product_id = ?", [req.params.id]);
      if (Array.isArray(colors)) {
        colors.forEach((color: { name: string; hex: string }) => {
          dbRun("INSERT INTO product_colors (product_id, name, hex) VALUES (?, ?, ?)", [req.params.id, color.name, color.hex]);
        });
      }
    }

    // Update sizes if provided
    if (sizes !== undefined) {
      dbRun("DELETE FROM product_sizes WHERE product_id = ?", [req.params.id]);
      if (Array.isArray(sizes)) {
        sizes.forEach((size: string) => {
          dbRun("INSERT INTO product_sizes (product_id, size) VALUES (?, ?)", [req.params.id, size]);
        });
      }
    }

    // Update images if provided
    if (images !== undefined) {
      dbRun("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
      if (Array.isArray(images)) {
        images.forEach((img: { url: string; color?: string; colorHex?: string }, index: number) => {
          dbRun(
            "INSERT INTO product_images (product_id, url, color, color_hex, sort_order) VALUES (?, ?, ?, ?, ?)",
            [req.params.id, img.url, img.color || null, img.colorHex || null, index]
          );
        });
      }
    }
    
    const updated = dbGet("SELECT * FROM products WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao atualizar produto" });
  }
});

// Delete product
router.delete("/products/:id", adminMiddleware, async (req, res) => {
  try {
    await getDatabase();
    
    // Delete related data first
    dbRun("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
    dbRun("DELETE FROM product_colors WHERE product_id = ?", [req.params.id]);
    dbRun("DELETE FROM product_sizes WHERE product_id = ?", [req.params.id]);
    
    // Delete product
    dbRun("DELETE FROM products WHERE id = ?", [req.params.id]);
    
    res.json({ message: "Produto excluído com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao excluir produto" });
  }
});

export default router;

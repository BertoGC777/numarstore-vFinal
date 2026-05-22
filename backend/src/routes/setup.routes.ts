import { Router } from "express"
import bcrypt from "bcryptjs"
import { pool } from "../db/postgres"
import { generateToken, generateRefreshToken } from "../middleware/auth"
import { resolveImageUrl } from "../utils/imageResolver"
import { setupGuard } from "../middleware/setupGuard"

const router = Router()
router.use(setupGuard)

// Debug endpoint to check JWT configuration
router.get("/debug-jwt", (_req, res) => {
  res.json({
    jwtSecretConfigured: !!process.env.JWT_SECRET,
    jwtRefreshSecretConfigured: !!process.env.JWT_REFRESH_SECRET,
    tokenExpiration: "604800", // Hardcoded 7 days in seconds
    refreshExpiration: "2592000", // Hardcoded 30 days in seconds
    databaseUrlConfigured: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV || "development"
  })
})

// Debug endpoint to check product images
router.get("/debug-products", async (req, res) => {
  try {
    // Get first product
    const product = await pool.query(
      "SELECT id, name, slug FROM products LIMIT 1"
    );
    
    if (product.rows.length === 0) {
      return res.json({ error: "No products found" });
    }
    
    const productId = product.rows[0].id;
    
    // Get images for this product
    const images = await pool.query(
      "SELECT url, color, sort_order FROM product_images WHERE product_id = $1 ORDER BY sort_order",
      [productId]
    );
    
    const slug = product.rows[0].slug;
    const convertedImages = images.rows.map((img: { url: string; color?: string }) => ({
      ...img,
      url: resolveImageUrl(slug, img),
    }));

    res.json({
      product: product.rows[0],
      imagesCount: images.rows.length,
      images: convertedImages,
      message: images.rows.length > 0 ? "Images found" : "No images found for this product"
    });
  } catch (error: any) {
    console.error("Debug products error:", error);
    res.status(500).json({ error: error.message });
  }
})

router.get("/check-admin", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE email = 'admin@numarstore.com'"
    )
    if (result.rows.length === 0) {
      res.json({ exists: false, message: "Admin user not found" })
    } else {
      const user = result.rows[0]
      // Ensure role is admin
      if (user.role !== 'admin') {
        await pool.query(
          "UPDATE users SET role = 'admin' WHERE email = 'admin@numarstore.com'"
        )
        user.role = 'admin'
      }
      res.json({ exists: true, user })
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.post("/create-admin", async (req, res) => {
  console.log("DATABASE_URL existe?", !!process.env.DATABASE_URL)
  console.log("Pool importado?", !!pool)
  try {
    const hash = await bcrypt.hash("admin123", 10)
    console.log("Tentando criar admin...")
    const result = await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, created_at)
      VALUES (gen_random_uuid(), 'Admin', 'admin@numarstore.com', $1, 'admin', $2)
      ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'admin'
      RETURNING id, email, role
    `, [hash, Date.now()])
    console.log("Admin criado:", result.rows[0])
    res.json({ success: true, user: result.rows[0] })
  } catch (e: any) {
    console.error("ERRO COMPLETO:", JSON.stringify({
      message: e.message,
      code: e.code,
      detail: e.detail,
      stack: e.stack
    }, null, 2))
    res.status(500).json({ error: e.message, detail: e.detail })
  }
})

// Ensure admin user exists and has correct role
router.get("/ensure-admin", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE email = 'admin@numarstore.com'"
    )
    
    if (result.rows.length === 0) {
      // Create admin user
      const hash = await bcrypt.hash("admin123", 10)
      const createResult = await pool.query(`
        INSERT INTO users (id, name, email, password_hash, role, created_at)
        VALUES (gen_random_uuid(), 'Admin', 'admin@numarstore.com', $1, 'admin', $2)
        RETURNING id, email, role
      `, [hash, Date.now()])
      res.json({ 
        success: true, 
        action: "created",
        user: createResult.rows[0] 
      })
    } else {
      const user = result.rows[0]
      if (user.role !== 'admin') {
        // Update role to admin
        await pool.query(
          "UPDATE users SET role = 'admin' WHERE email = 'admin@numarstore.com'"
        )
        user.role = 'admin'
        res.json({ 
          success: true, 
          action: "updated_role",
          user 
        })
      } else {
        res.json({ 
          success: true, 
          action: "already_exists",
          user 
        })
      }
    }
  } catch (error: any) {
    console.error("Ensure admin error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Update image URLs in database to use backend URL (GET for easier testing)
router.get("/update-image-urls", async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_URL || 'https://numarstore-backend.onrender.com';
    
    // Update all image URLs from relative to absolute
    const result = await pool.query(
      "UPDATE product_images SET url = $1 || url WHERE url LIKE '/images/%' RETURNING id, url",
      [backendUrl]
    );
    
    res.json({
      success: true,
      updatedCount: result.rows.length,
      backendUrl,
      message: `Updated ${result.rows.length} image URLs to use backend URL`,
      sampleUrls: result.rows.slice(0, 5)
    });
  } catch (error: any) {
    console.error("Update image URLs error:", error);
    res.status(500).json({ error: error.message });
  }
})

// Corrige URLs de imagens no banco para arquivos reais em public/images
router.get("/fix-image-urls", async (_req, res) => {
  try {
    const products = await pool.query("SELECT id, slug FROM products");
    let updatedCount = 0;
    const samples: Array<{ slug: string; color: string; oldUrl: string; newUrl: string }> = [];

    for (const product of products.rows) {
      const images = await pool.query(
        "SELECT id, url, color FROM product_images WHERE product_id = $1",
        [product.id]
      );

      for (const img of images.rows) {
        const newUrl = resolveImageUrl(product.slug, img);
        if (newUrl !== img.url) {
          await pool.query("UPDATE product_images SET url = $1 WHERE id = $2", [newUrl, img.id]);
          updatedCount++;
          if (samples.length < 8) {
            samples.push({
              slug: product.slug,
              color: img.color,
              oldUrl: img.url,
              newUrl,
            });
          }
        }
      }
    }

    res.json({
      success: true,
      updatedCount,
      totalProducts: products.rows.length,
      message: `Corrigidas ${updatedCount} URLs de imagens`,
      samples,
    });
  } catch (error: any) {
    console.error("Fix image URLs error:", error);
    res.status(500).json({ error: error.message });
  }
})

// Test token generation
router.get("/test-token", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, role FROM users WHERE email = 'admin@numarstore.com' LIMIT 1"
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" })
    }
    
    const admin = result.rows[0]
    const token = generateToken({ id: admin.id, email: admin.email, name: admin.name, role: admin.role })
    const refreshToken = generateRefreshToken({ id: admin.id })
    
    res.json({
      tokenGenerated: !!token,
      refreshTokenGenerated: !!refreshToken,
      adminEmail: admin.email,
      adminRole: admin.role
    })
  } catch (err) {
    console.error("Test token error:", err)
    res.status(500).json({ error: "Erro ao testar token" })
  }
})

export default router

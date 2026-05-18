import { Router } from "express"
import bcrypt from "bcryptjs"
import { pool } from "../db/postgres"

const router = Router()

router.get("/check-admin", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE email = 'admin@numarstore.com.br'"
    )
    if (result.rows.length === 0) {
      res.json({ exists: false, message: "Admin user not found" })
    } else {
      res.json({ exists: true, user: result.rows[0] })
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.post("/create-admin", async (req, res) => {
  const secret = req.headers["x-setup-secret"]
  if (secret !== "numar-setup-2026") {
    return res.status(403).json({ error: "Não autorizado" })
  }
  console.log("DATABASE_URL existe?", !!process.env.DATABASE_URL)
  console.log("Pool importado?", !!pool)
  try {
    const hash = await bcrypt.hash("admin123", 10)
    console.log("Tentando criar admin...")
    const result = await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, created_at)
      VALUES (gen_random_uuid(), 'Admin', 'admin@numarstore.com.br', $1, 'admin', $2)
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

export default router

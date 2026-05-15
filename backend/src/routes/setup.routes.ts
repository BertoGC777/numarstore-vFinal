import { Router } from "express"
import bcrypt from "bcryptjs"
import { pool } from "../db/postgres"

const router = Router()

router.post("/create-admin", async (req, res) => {
  const secret = req.headers["x-setup-secret"]
  if (secret !== "numar-setup-2026") {
    return res.status(403).json({ error: "Não autorizado" })
  }
  try {
    const hash = await bcrypt.hash("admin123", 10)
    await pool.query(`
      INSERT INTO users (id, name, email, password, role, created_at)
      VALUES (gen_random_uuid(), 'Admin', 'admin@numarstore.com.br', $1, 'admin', NOW())
      ON CONFLICT (email) DO UPDATE SET password = $1, role = 'admin'
    `, [hash])
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router

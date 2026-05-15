import { Router } from "express"
import bcrypt from "bcryptjs"

const router = Router()

router.post("/create-admin", async (req, res) => {
  const secret = req.headers["x-setup-secret"]
  if (secret !== "numar-setup-2026") {
    return res.status(403).json({ error: "Não autorizado" })
  }
  try {
    const { dbRun, dbGet } = await import("../db")
    const hash = await bcrypt.hash("admin123", 10)
    const id = crypto.randomUUID()
    dbRun(`
      INSERT INTO users (id, name, email, password_hash, role, created_at)
      VALUES ($1, 'Admin', 'admin@numarstore.com.br', $2, 'admin', NOW())
      ON CONFLICT (email) DO UPDATE SET password_hash = $2, role = 'admin'
    `, [id, hash, hash])
    res.json({ success: true, message: "Admin criado" })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router

import bcrypt from "bcryptjs"
import { pool } from "../db/postgres"

async function createAdmin() {
  const hash = await bcrypt.hash("admin123", 10)
  await pool.query(`
    INSERT INTO users (id, name, email, password_hash, role, created_at)
    VALUES (gen_random_uuid(), 'Admin', 'admin@numarstore.com', $1, 'admin', NOW())
    ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'admin'
  `, [hash])
  console.log("✅ Admin criado com sucesso: admin@numarstore.com / admin123")
  await pool.end()
}
createAdmin()

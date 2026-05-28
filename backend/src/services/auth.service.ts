import bcrypt from "bcryptjs";
import { generateToken, generateRefreshToken } from "../middleware/auth";
import type { AuthPayload } from "../middleware/auth";
import { dbRun, dbGet, dbAll, getDatabase } from "../db";

export { generateToken, generateRefreshToken };

export async function registerUser(name: string, email: string, phone: string | null, password: string) {
  await getDatabase();
  const existing = await dbGet("SELECT id FROM users WHERE email = $1", [email]);
  if (existing) throw new Error("EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  await dbRun("INSERT INTO users (id, name, email, phone, password_hash, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, name, email, phone, passwordHash, Date.now()]);

  return { token: generateToken({ id, email, name, role: "user" }), refreshToken: generateRefreshToken({ id }) };
}

export async function loginUser(email: string, password: string) {
  await getDatabase();
  
  const user = await dbGet<{ id: string; name: string; email: string; password_hash: string; role: string; phone: string | null }>("SELECT * FROM users WHERE email = $1", [email]);
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken({ id: user.id, email: user.email, name: user.name, role: user.role || "user" });
  const refreshToken = generateRefreshToken({ id: user.id });

  return {
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role || "user", phone: user.phone }
  };
}

export async function getUserById(id: string) {
  await getDatabase();
  const r = await dbGet<{ id: string; name: string; email: string; phone: string | null; role: string }>("SELECT id, name, email, phone, role FROM users WHERE id = $1", [id]);
  if (!r) throw new Error("USER_NOT_FOUND");
  return r;
}

export async function updateUser(id: string, data: { name?: string; phone?: string | null }) {
  await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) { fields.push("name = $1"); values.push(data.name); }
  if (data.phone !== undefined) { fields.push("phone = $1"); values.push(data.phone); }
  if (!fields.length) return getUserById(id);
  await dbRun(`UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length + 1}`, [...values, id]);
  return getUserById(id);
}

export async function createPasswordResetToken(email: string) {
  await getDatabase();
  const user = await dbGet<{ id: string; email: string }>("SELECT id, email FROM users WHERE email = $1", [email]);
  if (!user) throw new Error("USER_NOT_FOUND");

  const token = crypto.randomUUID();
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
  const id = crypto.randomUUID();

  await dbRun("INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)",
    [id, user.id, token, expiresAt, Date.now()]);

  return { token, userId: user.id };
}

export async function validateResetToken(token: string) {
  await getDatabase();
  const resetToken = await dbGet<{ user_id: string; expires_at: number }>(
    "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1",
    [token]
  );

  if (!resetToken) throw new Error("INVALID_TOKEN");
  if (resetToken.expires_at < Date.now()) throw new Error("TOKEN_EXPIRED");

  return resetToken.user_id;
}

export async function resetPassword(token: string, newPassword: string) {
  await getDatabase();
  const userId = await validateResetToken(token);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await dbRun("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);

  await dbRun("DELETE FROM password_reset_tokens WHERE token = $1", [token]);

  return { success: true };
}
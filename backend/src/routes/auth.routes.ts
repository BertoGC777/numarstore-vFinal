import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  registerUser, loginUser, getUserById, updateUser,
  createPasswordResetToken, resetPassword,
} from "../services/auth.service";
import { refreshMiddleware } from "../middleware/auth";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../services/email.service";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    const result = await registerUser(name, email, phone || null, password);
    
    // Send welcome email
    sendWelcomeEmail(email, name).catch(err => console.error('Failed to send welcome email:', err));
    
    res.json(result);
  } catch (e: any) {
    if (e.message === "EMAIL_EXISTS") return res.status(409).json({ error: "E-mail já cadastrado" });
    res.status(500).json({ error: e.message || "Erro ao registrar" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ error: e.message || "E-mail ou senha inválidos" });
  }
});

router.post("/refresh", refreshMiddleware);

router.get("/profile", authMiddleware, async (req: any, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch { res.status(500).json({ error: "Erro ao buscar perfil" }); }
});

router.put("/profile", authMiddleware, async (req: any, res) => {
  try {
    const updated = await updateUser(req.user.id, req.body);
    res.json(updated);
  } catch { res.status(500).json({ error: "Erro ao atualizar perfil" }); }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });

    const result = await createPasswordResetToken(email);
    
    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL || 'https://numarstore-v-final.vercel.app'}/reset-password?token=${result.token}`;
    sendPasswordResetEmail(email, resetLink).catch(err => console.error('Failed to send password reset email:', err));
    
    res.json({ message: "Token de redefinição gerado", token: result.token });
  } catch (e: any) {
    if (e.message === "USER_NOT_FOUND") return res.status(404).json({ error: "E-mail não encontrado" });
    res.status(500).json({ error: e.message || "Erro ao gerar token" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token e senha são obrigatórios" });
    if (password.length < 6) return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres" });

    await resetPassword(token, password);
    res.json({ message: "Senha redefinida com sucesso" });
  } catch (e: any) {
    if (e.message === "INVALID_TOKEN") return res.status(400).json({ error: "Token inválido" });
    if (e.message === "TOKEN_EXPIRED") return res.status(400).json({ error: "Token expirado" });
    res.status(500).json({ error: e.message || "Erro ao redefinir senha" });
  }
});

export default router;
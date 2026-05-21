import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { dbGet, getDatabase } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "sua-secret-aqui-troque-isso";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "sua-refresh-secret";
// Hardcoded values to avoid environment variable issues
// 7 days = 604800 seconds, 30 days = 2592000 seconds
const TOKEN_EXPIRATION = "604800"; // 7 days in seconds - DO NOT use env var
const REFRESH_EXPIRATION = "2592000"; // 30 days in seconds

// Log configuration on startup
console.log("=== JWT Configuration ===");
console.log("JWT_SECRET configured:", !!process.env.JWT_SECRET);
console.log("JWT_REFRESH_SECRET configured:", !!process.env.JWT_REFRESH_SECRET);
console.log("TOKEN_EXPIRATION (hardcoded):", TOKEN_EXPIRATION, "seconds (7 days)");
console.log("REFRESH_EXPIRATION (hardcoded):", REFRESH_EXPIRATION, "seconds (30 days)");
console.log("JWT_SECRET length:", JWT_SECRET.length);
console.log("JWT_REFRESH_SECRET length:", JWT_REFRESH_SECRET.length);
console.log("========================");

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface AuthPayload {
  id: string; email: string; name: string; role?: string;
}

export interface RefreshPayload {
  id: string; type: "refresh";
}

function jwtSign(payload: object, secret: string, expiresIn: string): string {
   return jwt.sign(payload, secret, { expiresIn, algorithm: "HS256" } as jwt.SignOptions);
 }

function verifyJwt(token: string, secret: string): jwt.JwtPayload {
  return jwt.verify(token, secret) as jwt.JwtPayload;
}

export function generateToken(payload: AuthPayload): string {
  const token = jwtSign(payload, JWT_SECRET, TOKEN_EXPIRATION);
  const decoded = jwt.decode(token) as any;
  console.log("Generated access token with expiration:", TOKEN_EXPIRATION, "seconds");
  console.log("Token expires at:", new Date((decoded.exp || 0) * 1000).toISOString());
  console.log("Current time:", new Date().toISOString());
  console.log("Time until expiration:", decoded.exp ? `${((decoded.exp * 1000) - Date.now()) / 1000}s` : "N/A");
  console.log("JWT_SECRET length used:", JWT_SECRET.length);
  return token;
}

export function generateRefreshToken(payload: { id: string }): string {
  const token = jwtSign({ ...payload, type: "refresh" }, JWT_REFRESH_SECRET, REFRESH_EXPIRATION);
  console.log("Generated refresh token with expiration:", REFRESH_EXPIRATION, "seconds");
  return token;
}

export function verifyToken(token: string): AuthPayload {
  const decoded = verifyJwt(token, JWT_SECRET);
  console.log("Token verified - User:", decoded.email, "Expires at:", new Date((decoded.exp || 0) * 1000).toISOString(), "JWT_SECRET length:", JWT_SECRET.length);
  return { id: decoded.id as string, email: decoded.email as string, name: decoded.name as string, role: (decoded.role as string | undefined) };
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = verifyJwt(token, JWT_REFRESH_SECRET);
  return { id: decoded.id as string, type: "refresh" };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = (req as Request).headers?.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  try {
    const token = authHeader.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch (err: any) {
    // Handle token expired error specifically
    if (err.name === 'TokenExpiredError') {
      console.error("Token expired error - Expired at:", err.expiredAt, "Current time:", new Date().toISOString());
      return res.status(401).json({ error: "Token expirado" });
    }
    // Handle other JWT errors
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = (req as Request).headers?.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    
    await getDatabase();
    const user = await dbGet<{ role: string }>("SELECT role FROM users WHERE id = $1", [decoded.id]);
    if (!user) {
      return res.status(403).json({ error: "Usuário não encontrado" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name, role: user.role };
    next();
  } catch (err: any) {
    // Handle token expired error specifically
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const refreshMiddleware = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token não fornecido" });
  }
  try {
    console.log("Refresh middleware - Verifying refresh token");
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Tipo de token inválido" });
    }

    await getDatabase();
    const user = await dbGet<{ id: string; name: string; email: string; role: string }>("SELECT id, name, email, role FROM users WHERE id = $1", [decoded.id]);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    console.log("Refresh middleware - Generating new tokens for user:", user.email);
    const newToken = generateToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    // Handle token expired error specifically
    if (err.name === 'TokenExpiredError') {
      console.error("Refresh token expired error - Expired at:", err.expiredAt);
      return res.status(401).json({ error: "Refresh token expirado" });
    }
    console.error("Refresh middleware error:", err.message);
    return res.status(401).json({ error: "Refresh token inválido" });
  }
};
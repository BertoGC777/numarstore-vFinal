import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { dbGet, getDatabase } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "sua-secret-aqui-troque-isso";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "sua-refresh-secret";
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || "256h";
const REFRESH_EXPIRATION = "7d";

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
  return jwtSign(payload, JWT_SECRET, TOKEN_EXPIRATION);
}

export function generateRefreshToken(payload: { id: string }): string {
  return jwtSign({ ...payload, type: "refresh" }, JWT_REFRESH_SECRET, REFRESH_EXPIRATION);
}

export function verifyToken(token: string): AuthPayload {
  const decoded = verifyJwt(token, JWT_SECRET);
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
      return res.status(401).json({ error: "Token expirado" });
    }
    // Handle other JWT errors
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
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Tipo de token inválido" });
    }

    await getDatabase();
    const user = await dbGet<{ id: string; name: string; email: string; role: string }>("SELECT id, name, email, role FROM users WHERE id = $1", [decoded.id]);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const newToken = generateToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    // Handle token expired error specifically
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Refresh token expirado" });
    }
    return res.status(401).json({ error: "Refresh token inválido" });
  }
};
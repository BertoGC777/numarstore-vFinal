import { Request, Response, NextFunction } from "express";

/** Em produção exige header x-setup-secret (rotas de manutenção) */
export function setupGuard(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "production") return next();

  const expected = process.env.SETUP_SECRET;
  if (!expected) {
    throw new Error("SETUP_SECRET não configurada no ambiente");
  }

  const secret = req.headers["x-setup-secret"];
  if (secret === expected) return next();

  return res.status(403).json({ error: "Não autorizado" });
}

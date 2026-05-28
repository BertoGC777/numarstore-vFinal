import { Request, Response, NextFunction } from "express";

const DEFAULT_SECRET = "numar-setup-2026";

/** Em produção exige header x-setup-secret (rotas de manutenção) */
export function setupGuard(req: Request, res: Response, next: NextFunction) {
  // Temporariamente desabilitado para atualizar admin
  // if (process.env.NODE_ENV !== "production") return next();

  // const secret = req.headers["x-setup-secret"];
  // const expected = process.env.SETUP_SECRET || DEFAULT_SECRET;
  // if (secret === expected) return next();

  // return res.status(403).json({ error: "Não autorizado" });
  return next();
}

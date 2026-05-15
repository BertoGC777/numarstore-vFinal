import { Router } from "express";
import { getDatabase } from "../db";

const router = Router();

router.get("/:cep", async (req: any, res: any) => {
  try {
    const cep = req.params.cep.replace(/\D/g, "");
    if (cep.length !== 8) return res.status(400).json({ error: "CEP inválido" });

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) return res.status(502).json({ error: "Erro ao buscar CEP" });

    const data: any = await response.json();
    if (data.erro) return res.status(404).json({ error: "CEP não encontrado" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao buscar CEP" });
  }
});

export default router;
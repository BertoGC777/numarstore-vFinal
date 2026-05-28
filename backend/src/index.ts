// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () { return this.toString(); };

import Sentry from "./sentry";
import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "./middleware/auth";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/orders.routes";
import cepRoutes from "./routes/cep.routes";
import paymentRoutes from "./routes/payment.routes";
import stripeRoutes from "./routes/stripe.routes";
import adminRoutes from "./routes/admin.routes";
import setupRoutes from "./routes/setup.routes";
import couponRoutes from "./routes/coupon.routes";
import reviewRoutes from "./routes/review.routes";
import { seedAll } from "./db/seed";

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

Sentry;

const publicDir = path.join(process.cwd(), "public");

// Imagens estáticas ANTES do helmet — permitir carregamento cross-origin (Vercel → Render)
app.use(
  "/images",
  express.static(path.join(publicDir, "images"), {
    setHeaders(res) {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(compression());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({ 
  origin: [
    "http://localhost:8080", 
    "http://localhost:5173", 
    "http://localhost:3000", 
    "https://numarstore-v-final.vercel.app",
    /https:\/\/numarstore-v-final-.*\.vercel\.app/
  ], 
  credentials: true 
}));

// Raw body para webhook Stripe (antes do json parser)
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));

app.use(express.static(publicDir));

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true });
const cepLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true });

app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/cep", cepLimiter, cepRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/setup", setupRoutes);

app.get("/api/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

app.use((err: any, _req: Request, res: Response, _next: Function) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Erro interno" });
});

async function start() {
  try {
    await seedAll();
    app.listen(PORT, () => console.log(`🚀 Backend porta ${PORT}`));
  } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error(String(err)));
      console.error("❌ Falha ao iniciar:", err);
      process.exit(1);
    }
}

start();
/**
 * Quran Twin - Backend Server
 * © 2026 Abdul-Quddus (@ghostscript0x). All rights reserved.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js";
import quranRoutes from "./src/routes/quran.routes.js";
import streakRoutes from "./src/routes/streak.routes.js";
import logger from "./src/lib/logger.js";
import { checkRateLimit } from "./src/lib/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

async function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const result = await checkRateLimit(ip);

  if (!result.allowed) {
    return res.status(429).json({
      error: "Too many requests, please try again later",
      retryAfter: result.reset
    });
  }

  res.setHeader("X-RateLimit-Remaining", result.remaining);
  res.setHeader("X-RateLimit-Reset", result.reset);
  next();
}

app.use(helmet());
app.use(rateLimit);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/quran", quranRoutes);
app.use("/user", streakRoutes);

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
export { server };
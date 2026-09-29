import { Router } from "express";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const healthRouter = Router();

healthRouter.get("/live", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

healthRouter.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "error", message: "Database unavailable" });
    }
  }),
);

export { healthRouter };

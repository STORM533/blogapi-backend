import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/client.js";

export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        message: "Forbidden",
      });
      return;
    }

    next();
  };
};

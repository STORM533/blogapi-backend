//Handles guest and user and author
import type { RequestHandler } from "express";
import { authenticateJWT } from "./auth.js";

export const optionalAuthenticateJWT: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    next();
    return;
  }

  authenticateJWT(req, res, next);
};

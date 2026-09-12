import { Router } from "express";
import { body } from "express-validator";
import { login, logout, signup } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validateRequest.js";

const authRouter = Router();

authRouter.post(
  "/signup",
  authLimiter,
  body("username")
    .trim()
    .isString()
    .withMessage("Username must be a string")
    .bail()
    .notEmpty()
    .withMessage("Username is required"),

  body("email").trim().isEmail().withMessage("Invalid email"),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  validateRequest,
  asyncHandler(signup),
);

authRouter.post(
  "/login",
  authLimiter,
  body("username").trim().notEmpty().withMessage("Username is required"),

  body("password").notEmpty().withMessage("Password is required"),

  validateRequest,
  login,
);

authRouter.post("/logout", logout);

export { authRouter };

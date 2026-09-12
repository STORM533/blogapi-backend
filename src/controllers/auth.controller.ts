import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "../middleware/auth.js";
import { signup as signupService } from "../services/auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 1000,
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: unknown, user: Express.User | false) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1h",
        },
      );

      res.cookie("token", token, COOKIE_OPTIONS);

      return res.json({
        token,
      });
    },
  )(req, res, next);
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out" });
};

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const user = await signupService(username, email, password);

  res.status(201).json(user);
};

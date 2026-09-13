//Handles guest and user and author
import type { RequestHandler } from "express";
import passport from "passport";

export const optionalAuthenticateJWT: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: unknown, user: Express.User | false) => {
      if (!err && user) {
        req.user = user;
      }
      next();
    },
  )(req, res, next);
};

import bcrypt from "bcrypt";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { AppError } from "../errors/AppError.js";
import prisma from "../lib/prisma.js";
import type { JwtPayload } from "../types/auth.js";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return done(new AppError("Invalid credentials", 401), false);
      }

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        return done(new AppError("Invalid credentials", 401), false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload: JwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);
export const authenticateJWT = passport.authenticate("jwt", { session: false });
export default passport;

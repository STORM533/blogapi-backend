import cors from "cors";
import express from "express";
import { AppError } from "./errors/AppError.js";
import passport from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { authRouter } from "./routes/auth.routes.js";
import { commentsRouter } from "./routes/comments.routes.js";
import { postsRouter } from "./routes/posts.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import helmet from "helmet";
const app = express();
app.use(helmet());
const corsOrigins = [
  process.env.CORS_ORIGIN_USER,
  process.env.CORS_ORIGIN_AUTHOR,
].filter((origin): origin is string => Boolean(origin));

if (corsOrigins.length > 0) {
  app.use(
    cors({
      origin: corsOrigins,
    }),
  );
}
app.use(express.json());
app.use(apiLimiter);
app.use(passport.initialize());

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use(usersRouter);
app.use(commentsRouter);

app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);
export default app;

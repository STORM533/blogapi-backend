import express from "express";
import passport from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { authRouter } from "./routes/auth.routes.js";
import { commentsRouter } from "./routes/comments.routes.js";
import { postsRouter } from "./routes/posts.routes.js";
const app = express();

app.use(express.json());
app.use(apiLimiter);
app.use(passport.initialize());

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use(commentsRouter);
app.use(errorHandler);
export default app;

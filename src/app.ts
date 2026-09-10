import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import { commentsRouter } from "./routes/comments.routes.js";
import { postsRouter } from "./routes/posts.routes.js";
const app = express();

app.use(express.json());
app.use("/posts", postsRouter);
app.use(commentsRouter);
app.use(errorHandler);
export default app;

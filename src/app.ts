import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import { postsRouter } from "./routes/posts.routes.js";

const app = express();

app.use(express.json());
app.use("/posts", postsRouter);
app.use(errorHandler);
export default app;

import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { getPostById } from "../services/posts.service.js";

interface postParam {
  id: string;
}
interface createPostBody {
  title: string;
  content: string;
}
export const getPost = (req: Request<postParam>, res: Response) => {
  const post = getPostById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  res.json(post);
};
export const createPost = (
  req: Request<{}, {}, createPostBody>,
  res: Response,
) => {
  const { title, content } = req.body;
  res.status(201).json({ message: "post Created", post: { title, content } });
};

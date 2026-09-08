import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  createPost as createPostService,
  getPostById,
} from "../services/posts.service.js";

interface PostParams {
  id: string;
}

export const getPost = async (req: Request<PostParams>, res: Response) => {
  const post = await getPostById(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  res.json(post);
};

interface CreatePostBody {
  title: string;
  content: string;
}

export const createPost = async (
  req: Request<{}, {}, CreatePostBody>,
  res: Response,
) => {
  const { title, content } = req.body;

  const post = await createPostService(title, content, 1);

  res.status(201).json(post);
};

import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";

import {
  createPost as createPostService,
  deletePost as deletePostService,
  getPostById,
  getPublishedPosts,
  updatePost as updatePostService,
} from "../services/posts.service.js";

interface PostParams {
  [key: string]: string;
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

export const getPosts = async (req: Request, res: Response) => {
  const posts = await getPublishedPosts();

  res.json(posts);
};

interface UpdatePostBody {
  title: string;
  content: string;
}

export const updatePost = async (
  req: Request<PostParams, {}, UpdatePostBody>,
  res: Response,
) => {
  const { title, content } = req.body;

  const post = await updatePostService(req.params.id, title, content);

  res.json(post);
};
export const deletePost = async (req: Request<PostParams>, res: Response) => {
  await deletePostService(req.params.id);

  res.status(204).send();
};

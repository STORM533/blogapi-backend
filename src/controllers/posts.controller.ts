import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

import { AppError } from "../errors/AppError.js";

import {
  createPost as createPostService,
  deletePost as deletePostService,
  getPostById,
  getPublishedPosts,
  updatePost as updatePostService,
} from "../services/posts.service.js";

import type {
  CreatePostBody,
  PostParams,
  PostsQuery,
  UpdatePostBody,
} from "../types/posts.js";

export const getPost = async (req: Request<PostParams>, res: Response) => {
  const post = await getPostById(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  res.json(post);
};

export const createPost = async (
  req: Request<object, object, CreatePostBody>,
  res: Response,
) => {
  const { title, content } = req.body;

  const post = await createPostService(title, content, 1);

  res.status(201).json(post);
};

export const getPosts = async (
  req: Request<ParamsDictionary, object, object, PostsQuery>,
  res: Response,
) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const posts = await getPublishedPosts(page, limit);

  res.json(posts);
};

export const updatePost = async (
  req: Request<PostParams, object, UpdatePostBody>,
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

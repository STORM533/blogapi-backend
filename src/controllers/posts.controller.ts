import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

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
  const id = Number(req.params.id);

  const post = await getPostById(id);

  res.json(post);
};
export const createPost = async (
  req: Request<object, object, CreatePostBody>,
  res: Response,
) => {
  const { title, content } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const authorId = req.user.id;
  const post = await createPostService(title, content, authorId);

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
  const id = Number(req.params.id);
  const { title, content } = req.body;

  const post = await updatePostService(id, title, content);

  res.json(post);
};
export const deletePost = async (req: Request<PostParams>, res: Response) => {
  const id = Number(req.params.id);

  await deletePostService(id);

  res.status(204).send();
};

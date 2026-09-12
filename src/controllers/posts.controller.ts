import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

import {
  createPost as createPostService,
  deletePost as deletePostService,
  getPostById,
  getPostsAll,
  getPostStats as getPostStatsService,
  setPostPublished as setPostPublishedService,
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

  const post = await getPostById(id, req.user?.role);

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

  const posts = await getPostsAll(page, limit, req.user?.role);

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
export const setPostPublished = async (
  req: Request<PostParams, object, { published: boolean }>,
  res: Response,
) => {
  const id = Number(req.params.id);

  const post = await setPostPublishedService(id, req.body.published);

  res.json(post);
};

export const getStats = async (_req: Request, res: Response) => {
  const stats = await getPostStatsService();
  res.json(stats);
};

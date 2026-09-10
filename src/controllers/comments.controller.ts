import type { Request, Response } from "express";

import {
  createComment as createCommentService,
  deleteComment as deleteCommentService,
  getCommentsByPostId,
  updateComment as updateCommentService,
} from "../services/comments.service.js";

import type {
  CommentBody,
  CommentParams,
  PostCommentParams,
} from "../types/comments.js";

export const getComments = async (
  req: Request<PostCommentParams>,
  res: Response,
) => {
  const comments = await getCommentsByPostId(req.params.postId);

  res.json(comments);
};

export const createComment = async (
  req: Request<PostCommentParams, object, CommentBody>,
  res: Response,
) => {
  const { content } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  const comment = await createCommentService(
    content,
    req.params.postId,
    userId,
  );

  res.status(201).json(comment);
};

export const updateComment = async (
  req: Request<CommentParams, object, CommentBody>,
  res: Response,
) => {
  const { content } = req.body;

  const comment = await updateCommentService(req.params.id, content);

  res.json(comment);
};

export const deleteComment = async (
  req: Request<CommentParams>,
  res: Response,
) => {
  await deleteCommentService(req.params.id);

  res.status(204).send();
};

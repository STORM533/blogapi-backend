import type { Request, Response } from "express";

import {
  createComment as createCommentService,
  deleteComment as deleteCommentService,
  getCommentsByPostId,
  updateComment as updateCommentService,
} from "../services/comments.service.js";

interface PostParams {
  postId: string;
}

interface CommentParams {
  id: string;
}

interface CreateCommentBody {
  content: string;
}

interface UpdateCommentBody {
  content: string;
}

export const getComments = async (req: Request<PostParams>, res: Response) => {
  const comments = await getCommentsByPostId(req.params.postId);

  res.json(comments);
};

export const createComment = async (
  req: Request<PostParams, object, CreateCommentBody>,
  res: Response,
) => {
  const { content } = req.body;

  // Temporary until JWT authentication exists.
  const userId = 1;

  const comment = await createCommentService(
    content,
    req.params.postId,
    userId,
  );

  res.status(201).json(comment);
};

export const updateComment = async (
  req: Request<CommentParams, object, UpdateCommentBody>,
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

import { Router } from "express";
import { body } from "express-validator";

import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comments.controller.js";

import { validateRequest } from "../middleware/validateRequest.js";

const commentsRouter = Router();

interface PostParams {
  [key: string]: string;
  postId: string;
}

interface CommentParams {
  [key: string]: string;
  id: string;
}

interface CommentBody {
  content: string;
}

commentsRouter.get<PostParams>("/posts/:postId/comments", getComments);

commentsRouter.post<PostParams, object, CommentBody>(
  "/posts/:postId/comments",

  body("content")
    .trim()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,

  createComment,
);

commentsRouter.patch<CommentParams, object, CommentBody>(
  "/comments/:id",

  body("content")
    .trim()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,

  updateComment,
);

commentsRouter.delete<CommentParams>("/comments/:id", deleteComment);

export { commentsRouter };

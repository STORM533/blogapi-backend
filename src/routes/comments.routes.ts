import { Router } from "express";
import { body } from "express-validator";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comments.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import type {
  CommentBody,
  CommentParams,
  PostCommentParams,
} from "../types/comments.js";

const commentsRouter = Router();

commentsRouter.get<PostCommentParams>("/posts/:postId/comments", getComments);

commentsRouter.post<PostCommentParams, object, CommentBody>(
  "/posts/:postId/comments",
  authenticateJWT,
  body("content")
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,

  createComment,
);

commentsRouter.patch<CommentParams, object, CommentBody>(
  "/comments/:id",
  authenticateJWT,
  body("content")
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,

  updateComment,
);

commentsRouter.delete<CommentParams>("/comments/:id",authenticateJWT, deleteComment);

export { commentsRouter };

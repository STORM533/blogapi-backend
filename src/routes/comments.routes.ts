import { Router } from "express";
import { body } from "express-validator";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comments.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import {
  canDeleteComment,
  requireCommentOwner,
} from "../middleware/commentAuth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import type {
  CommentBody,
  CommentParams,
  PostCommentParams,
} from "../types/comments.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuthenticateJWT } from "../middleware/optionalAuth.js";

const commentsRouter = Router();

commentsRouter.get<PostCommentParams>("/posts/:postId/comments",optionalAuthenticateJWT, getComments);

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

  asyncHandler(createComment),
);

commentsRouter.patch<CommentParams, object, CommentBody>(
  "/comments/:id",
  authenticateJWT,
  requireCommentOwner,
  body("content")
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,

  asyncHandler(updateComment),
);

commentsRouter.delete<CommentParams>(
  "/comments/:id",
  authenticateJWT,
  canDeleteComment,
  asyncHandler(deleteComment),
);

export { commentsRouter };

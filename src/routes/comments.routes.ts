import { Router } from "express";
import { body, param } from "express-validator";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comments.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateJWT } from "../middleware/auth.js";
import {
  canDeleteComment,
  requireCommentOwner,
} from "../middleware/commentAuth.js";
import { optionalAuthenticateJWT } from "../middleware/optionalAuth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import type {
  CommentBody,
  CommentParams,
  PostCommentParams,
} from "../types/comments.js";

const commentsRouter = Router();

commentsRouter.get<PostCommentParams>(
  "/posts/:postId/comments",
  optionalAuthenticateJWT,
  param("postId")
    .isInt({ min: 1 })
    .withMessage("Post ID must be a positive integer"),
  validateRequest,
  asyncHandler(getComments),
);

commentsRouter.post<PostCommentParams, object, CommentBody>(
  "/posts/:postId/comments",
  authenticateJWT,
  param("postId")
    .isInt({ min: 1 })
    .withMessage("Post ID must be a positive integer"),
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
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

  body("content")
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,
  requireCommentOwner,
  asyncHandler(updateComment),
);

commentsRouter.delete<CommentParams>(
  "/comments/:id",
  authenticateJWT,
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  validateRequest,
  canDeleteComment,
  asyncHandler(deleteComment),
);

export { commentsRouter };

import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { body, param, query } from "express-validator";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getStats,
  setPostPublished,
  updatePost,
} from "../controllers/posts.controller.js";
import { Role } from "../generated/prisma/client.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

import { validateRequest } from "../middleware/validateRequest.js";

import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuthenticateJWT } from "../middleware/optionalAuth.js";
import type {
  CreatePostBody,
  PostParams,
  PostsQuery,
  UpdatePostBody,
} from "../types/posts.js";
const postsRouter = Router();

postsRouter.get<ParamsDictionary, object, object, PostsQuery>(
  "/",
  optionalAuthenticateJWT,
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  validateRequest,

  asyncHandler(getPosts),
);

postsRouter.get(
  "/stats",
  authenticateJWT,
  requireRole(Role.AUTHOR),
  asyncHandler(getStats),
);

postsRouter.get<PostParams>(
  "/:id",
  optionalAuthenticateJWT,
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  validateRequest,
  asyncHandler(getPost),
);

postsRouter.post<ParamsDictionary, object, CreatePostBody>(
  "/",
  authenticateJWT,
  requireRole(Role.AUTHOR),
  body("title")
    .isString()
    .withMessage("Title must be String")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is Required")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),

  body("content")
    .isString()
    .withMessage("Content must be String")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content is Required")
    .bail(),

  body("published")
    .optional()
    .isBoolean()
    .withMessage("Published must be a boolean")
    .toBoolean(),

  validateRequest,

  asyncHandler(createPost),
);

postsRouter.patch<PostParams, object, UpdatePostBody>(
  "/:id",
  authenticateJWT,
  requireRole(Role.AUTHOR),
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

  body().custom((_, { req }) => {
    if (req.body.title === undefined && req.body.content === undefined) {
      throw new Error("At least one of title or content is required");
    }

    return true;
  }),

  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),

  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,

  asyncHandler(updatePost),
);

postsRouter.delete<PostParams>(
  "/:id",
  authenticateJWT,
  requireRole(Role.AUTHOR),
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

  validateRequest,
  asyncHandler(deletePost),
);
postsRouter.patch<PostParams, object, { published: boolean }>(
  "/:id/publish",
  authenticateJWT,
  requireRole(Role.AUTHOR),
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  body("published")
    .isBoolean()
    .withMessage("Published must be a boolean")
    .toBoolean(),
  validateRequest,
  asyncHandler(setPostPublished),
);
export { postsRouter };

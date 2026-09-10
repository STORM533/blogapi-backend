import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { body, query } from "express-validator";

import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/posts.controller.js";

import { validateRequest } from "../middleware/validateRequest.js";

import type {
  CreatePostBody,
  PostParams,
  PostsQuery,
  UpdatePostBody,
} from "../types/posts.js";

const postsRouter = Router();

postsRouter.get<ParamsDictionary, object, object, PostsQuery>(
  "/",

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  validateRequest,

  getPosts,
);

postsRouter.get<PostParams>("/:id", getPost);

postsRouter.post<ParamsDictionary, object, CreatePostBody>(
  "/",

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

  validateRequest,

  createPost,
);

postsRouter.patch<PostParams, object, UpdatePostBody>(
  "/:id",

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

  updatePost,
);

postsRouter.delete<PostParams>("/:id", deletePost);

export { postsRouter };

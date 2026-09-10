import { Router } from "express";
import { body, query } from "express-validator";

import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/posts.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";

interface PostParams {
  [key: string]: string;
  id: string;
}

const postsRouter = Router();

postsRouter.get(
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

postsRouter.get("/:id", getPost);

postsRouter.post(
  "/",
  body("title")
    .trim()
    .isString()
    .withMessage("Title must be String")
    .bail()
    .notEmpty()
    .withMessage("Title is Required")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),

  body("content")
    .trim()
    .isString()
    .withMessage("Content must be String")
    .bail()
    .notEmpty()
    .withMessage("Content is Required")
    .bail(),

  validateRequest,
  createPost,
);

postsRouter.patch<PostParams>(
  "/:id",
  body("title")
    .trim()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),

  body("content")
    .trim()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .notEmpty()
    .withMessage("Content cannot be empty"),

  validateRequest,
  updatePost,
);
postsRouter.delete("/:id", deletePost);
export { postsRouter };

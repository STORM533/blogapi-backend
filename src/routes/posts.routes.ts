import { Router } from "express";
import { body } from "express-validator";
import { createPost, getPost } from "../controllers/posts.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
const postsRouter = Router();
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
export { postsRouter };

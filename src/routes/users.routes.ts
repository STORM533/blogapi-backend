import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { query } from "express-validator";
import { getMe, getMyComments } from "../controllers/users.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import type { MeCommentsQuery } from "../types/users.js";

const usersRouter = Router();

usersRouter.get("/me", authenticateJWT, asyncHandler(getMe));

usersRouter.get<ParamsDictionary, object, object, MeCommentsQuery>(
  "/me/comments",
  authenticateJWT,
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  validateRequest,
  asyncHandler(getMyComments),
);

export { usersRouter };

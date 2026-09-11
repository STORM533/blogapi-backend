import type { NextFunction, Request, Response } from "express";
import { Role } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "./asyncHandler.js";
export const requireCommentOwner = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const commentId = Number(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({
        message: "Comment not found",
      });
      return;
    }

    if (comment.userId !== req.user.id) {
      res.status(403).json({
        message: "You can only modify your own comment",
      });
      return;
    }

    next();
  },
);
export const canDeleteComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const commentId = Number(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({
        message: "Comment not found",
      });
      return;
    }

    const isOwner = comment.userId === req.user.id;
    const isAuthor = req.user.role === Role.AUTHOR;

    if (!isOwner && !isAuthor) {
      res.status(403).json({
        message: "You are not allowed to delete this comment",
      });
      return;
    }

    next();
  },
);

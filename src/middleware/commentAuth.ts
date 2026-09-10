import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const requireCommentOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

export const canDeleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
  const isAuthor = req.user.role === "AUTHOR";

  if (!isOwner && !isAuthor) {
    res.status(403).json({
      message: "You are not allowed to delete this comment",
    });
    return;
  }

  next();
};

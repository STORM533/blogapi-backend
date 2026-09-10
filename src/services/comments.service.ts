import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

export const getCommentsByPostId = async (postId: string) => {
  return prisma.comment.findMany({
    where: {
      postId: Number(postId),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createComment = async (
  content: string,
  postId: string,
  userId: number,
) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return prisma.comment.create({
    data: {
      content,
      postId: Number(postId),
      userId,
    },
  });
};

export const updateComment = async (id: string, content: string) => {
  try {
    return await prisma.comment.update({
      where: {
        id: Number(id),
      },
      data: {
        content,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Comment not found", 404);
    }

    throw error;
  }
};

export const deleteComment = async (id: string) => {
  try {
    return await prisma.comment.delete({
      where: {
        id: Number(id),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Comment not found", 404);
    }

    throw error;
  }
};

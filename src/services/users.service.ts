import { AppError } from "../errors/AppError.js";
import prisma from "../lib/prisma.js";

export const getCurrentUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const getCommentsByUserId = async (
  userId: number,
  page: number,
  limit: number,
) => {
  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),

    prisma.comment.count({
      where: { userId },
    }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

export const getPostById = async (id: number) => {
  const post = await prisma.post.findUnique({
    where: { id, published: true },
  });
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  return post;
};

export const createPost = async (
  title: string,
  content: string,
  authorId: number,
) => {
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId,
    },
  });

  return post;
};
export const getPublishedPosts = async (page: number, limit: number) => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return posts;
};
export const updatePost = async (
  id: number,
  title?: string,
  content?: string,
) => {
  try {
    return await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Post not found", 404);
    }

    throw error;
  }
};
export const deletePost = async (id: number) => {
  try {
    return await prisma.post.delete({
      where: { id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Post not found", 404);
    }

    throw error;
  }
};

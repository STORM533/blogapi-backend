import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

export const getPostById = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
  });

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
  id: string,
  title?: string,
  content?: string,
) => {
  try {
    const post = await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });

    return post;
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
export const deletePost = async (id: string) => {
  try {
    const post = await prisma.post.delete({
      where: {
        id: Number(id),
      },
    });

    return post;
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

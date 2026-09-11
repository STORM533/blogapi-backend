import { AppError } from "../errors/AppError.js";
import { Prisma, Role } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

export const getPostById = async (id: number, role?: Role) => {
  const post = await prisma.post.findUnique({
    where:
      role === Role.AUTHOR
        ? { id }
        : {
            id,
            published: true,
          },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
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
export const getPostsAll = async (page: number, limit: number, role?: Role) => {
  const where =
    role === Role.AUTHOR
      ? {}
      : {
          published: true,
        };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),

    prisma.post.count({
      where,
    }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
export const setPostPublished = async (id: number, published: boolean) => {
  try {
    return await prisma.post.update({
      where: { id },
      data: {
        published,
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

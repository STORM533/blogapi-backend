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

import prisma from "../../src/lib/prisma.js";

export const resetDb = async () => {
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

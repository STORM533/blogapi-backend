import bcrypt from "bcrypt";
import { Role } from "../../src/generated/prisma/client.js";
import prisma from "../../src/lib/prisma.js";

// Low rounds keep tests fast; production hashing stays at 12 (auth.service).
export const SALT_ROUNDS = 4;

export const TEST_PASSWORD = "password123";

let hashedPassword: string | undefined;

const getPasswordHash = async () => {
  hashedPassword ??= await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS);
  return hashedPassword;
};

export type TestUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
};

export const createUser = async (
  overrides: Partial<{ username: string; email: string; role: Role }> = {},
): Promise<TestUser> => {
  const username =
    overrides.username ??
    `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user = await prisma.user.create({
    data: {
      username,
      email: overrides.email ?? `${username}@example.com`,
      password: await getPasswordHash(),
      role: overrides.role ?? Role.USER,
    },
  });
  return user;
};

export const createPost = async (
  authorId: number,
  overrides: Partial<{
    title: string;
    content: string;
    published: boolean;
  }> = {},
) => {
  return prisma.post.create({
    data: {
      title: overrides.title ?? "Test post",
      content: overrides.content ?? "Test post content",
      published: overrides.published ?? true,
      authorId,
    },
  });
};

export const createComment = async (
  userId: number,
  postId: number,
  overrides: Partial<{ content: string }> = {},
) => {
  return prisma.comment.create({
    data: {
      content: overrides.content ?? "Test comment",
      userId,
      postId,
    },
  });
};

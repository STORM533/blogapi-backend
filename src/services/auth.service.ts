import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError.js";
import prisma from "../lib/prisma.js";

export const signup = async (
  username: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new AppError("Username or email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
};

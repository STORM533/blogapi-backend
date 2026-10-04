import jwt from "jsonwebtoken";
import type { Response } from "supertest";
import type { TestUser } from "./factories.js";

export const makeAuthToken = (user: Pick<TestUser, "id" | "role">): string => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" },
  );
};

export const makeAuthHeader = (
  user: Pick<TestUser, "id" | "role">,
): Record<string, string> => {
  return { Authorization: `Bearer ${makeAuthToken(user)}` };
};

export const extractSetCookie = (res: Response): string | undefined => {
  const setCookie = res.headers["set-cookie"];
  if (Array.isArray(setCookie)) {
    return setCookie[0];
  }
  return setCookie;
};

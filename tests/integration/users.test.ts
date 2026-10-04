import { beforeEach, describe, expect, it } from "vitest";
import { Role } from "../../src/generated/prisma/client.js";
import api from "../helpers/api.js";
import { makeAuthHeader } from "../helpers/auth.js";
import { resetDb } from "../helpers/db.js";
import {
  createComment,
  createPost,
  createUser,
  TEST_PASSWORD,
} from "../helpers/factories.js";

describe("users", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("GET /me", () => {
    it("returns 401 without a token", async () => {
      const res = await api.get("/me");

      expect(res.status).toBe(401);
    });

    it("returns 401 with an invalid token", async () => {
      const res = await api
        .get("/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
    });

    it("returns the profile without the password", async () => {
      const user = await createUser({ username: "frodo" });

      const res = await api.get("/me").set(makeAuthHeader(user));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: user.id,
        username: "frodo",
        email: user.email,
        role: "USER",
        createdAt: expect.any(String),
      });
      expect(res.body).not.toHaveProperty("password");
    });

    it("authenticates via the httpOnly cookie from login", async () => {
      const user = await createUser({ username: "frodo" });

      const login = await api.post("/auth/login").send({
        username: user.username,
        password: TEST_PASSWORD,
      });
      expect(login.status).toBe(200);

      const cookie = String(login.headers["set-cookie"]).split(";")[0];
      const res = await api.get("/me").set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("frodo");
    });
  });

  describe("GET /me/comments", () => {
    it("returns 401 without a token", async () => {
      const res = await api.get("/me/comments");

      expect(res.status).toBe(401);
    });

    it("returns only the current user's comments with pagination", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const user = await createUser();
      const other = await createUser();
      const post = await createPost(author.id);

      await createComment(user.id, post.id, { content: "Mine 1" });
      await createComment(user.id, post.id, { content: "Mine 2" });
      await createComment(other.id, post.id, { content: "Theirs" });

      const res = await api.get("/me/comments").set(makeAuthHeader(user));

      expect(res.status).toBe(200);
      expect(res.body.comments).toHaveLength(2);
      expect(
        res.body.comments.map((c: { content: string }) => c.content).sort(),
      ).toEqual(["Mine 1", "Mine 2"]);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("includes the parent post reference", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const user = await createUser();
      const post = await createPost(author.id, { title: "Target" });
      await createComment(user.id, post.id);

      const res = await api.get("/me/comments").set(makeAuthHeader(user));

      expect(res.body.comments[0].post).toEqual({
        id: post.id,
        title: "Target",
      });
    });

    it("rejects an invalid page parameter", async () => {
      const user = await createUser();

      const res = await api
        .get("/me/comments?page=0")
        .set(makeAuthHeader(user));

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "page", message: "Page must be a positive integer" },
      ]);
    });

    it("rejects a limit above 50", async () => {
      const user = await createUser();

      const res = await api
        .get("/me/comments?limit=51")
        .set(makeAuthHeader(user));

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "limit", message: "Limit must be between 1 and 50" },
      ]);
    });
  });
});

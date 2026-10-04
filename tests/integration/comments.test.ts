import { beforeEach, describe, expect, it } from "vitest";
import { Role } from "../../src/generated/prisma/client.js";
import api from "../helpers/api.js";
import { makeAuthHeader } from "../helpers/auth.js";
import { resetDb } from "../helpers/db.js";
import { createComment, createPost, createUser } from "../helpers/factories.js";

describe("comments", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("GET /posts/:postId/comments", () => {
    it("returns comments for a published post as a guest", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const commenter = await createUser();
      const post = await createPost(author.id);
      await createComment(commenter.id, post.id, { content: "Hello" });

      const res = await api.get(`/posts/${post.id}/comments`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        content: "Hello",
        user: { id: commenter.id, username: commenter.username },
      });
    });

    it("rejects a non-numeric postId", async () => {
      const res = await api.get("/posts/abc/comments");

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "postId", message: "Post ID must be a positive integer" },
      ]);
    });

    it("returns 404 for a missing post", async () => {
      const res = await api.get("/posts/999999/comments");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Post not found" });
    });

    it("hides comments on an unpublished post from guests", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const post = await createPost(author.id, { published: false });

      const res = await api.get(`/posts/${post.id}/comments`);

      expect(res.status).toBe(404);
    });

    it("shows comments on an unpublished post to authors", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const post = await createPost(author.id, { published: false });

      const res = await api
        .get(`/posts/${post.id}/comments`)
        .set(makeAuthHeader(author));

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("POST /posts/:postId/comments", () => {
    it("returns 401 without a token", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const post = await createPost(author.id);

      const res = await api
        .post(`/posts/${post.id}/comments`)
        .send({ content: "Hi" });

      expect(res.status).toBe(401);
    });

    it("creates a comment for an authenticated user (201)", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const commenter = await createUser();
      const post = await createPost(author.id);

      const res = await api
        .post(`/posts/${post.id}/comments`)
        .set(makeAuthHeader(commenter))
        .send({ content: "Great post" });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(Number),
        content: "Great post",
        user: { id: commenter.id, username: commenter.username },
      });
    });

    it("rejects empty content", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const commenter = await createUser();
      const post = await createPost(author.id);

      const res = await api
        .post(`/posts/${post.id}/comments`)
        .set(makeAuthHeader(commenter))
        .send({ content: "  " });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "content", message: "Content cannot be empty" },
      ]);
    });

    it("returns 404 when the post does not exist", async () => {
      const commenter = await createUser();

      const res = await api
        .post("/posts/999999/comments")
        .set(makeAuthHeader(commenter))
        .send({ content: "Hi" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Post not found" });
    });

    it("rejects a non-numeric postId", async () => {
      const commenter = await createUser();

      const res = await api
        .post("/posts/abc/comments")
        .set(makeAuthHeader(commenter))
        .send({ content: "Hi" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "postId", message: "Post ID must be a positive integer" },
      ]);
    });
  });

  describe("PATCH /comments/:id", () => {
    it("allows the owner to update their comment", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const commenter = await createUser();
      const post = await createPost(author.id);
      const comment = await createComment(commenter.id, post.id);

      const res = await api
        .patch(`/comments/${comment.id}`)
        .set(makeAuthHeader(commenter))
        .send({ content: "Updated comment" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: comment.id,
        content: "Updated comment",
      });
    });

    it("rejects updates from a different regular user (403)", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const owner = await createUser();
      const intruder = await createUser();
      const post = await createPost(author.id);
      const comment = await createComment(owner.id, post.id);

      const res = await api
        .patch(`/comments/${comment.id}`)
        .set(makeAuthHeader(intruder))
        .send({ content: "Hijacked" });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: "You can only modify your own comment",
      });
    });

    it("rejects updates from another author too (403)", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const otherAuthor = await createUser({ role: Role.AUTHOR });
      const post = await createPost(author.id);
      const comment = await createComment(author.id, post.id);

      const res = await api
        .patch(`/comments/${comment.id}`)
        .set(makeAuthHeader(otherAuthor))
        .send({ content: "Hijacked" });

      expect(res.status).toBe(403);
    });

    it("returns 404 for a missing comment", async () => {
      const commenter = await createUser();

      const res = await api
        .patch("/comments/999999")
        .set(makeAuthHeader(commenter))
        .send({ content: "Hi" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Comment not found" });
    });

    it("returns 401 without a token", async () => {
      const res = await api.patch("/comments/1").send({ content: "Hi" });

      expect(res.status).toBe(401);
    });

    it("rejects empty content before ownership checks", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const commenter = await createUser();
      const post = await createPost(author.id);
      const comment = await createComment(commenter.id, post.id);

      const res = await api
        .patch(`/comments/${comment.id}`)
        .set(makeAuthHeader(commenter))
        .send({ content: "   " });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "content", message: "Content cannot be empty" },
      ]);
    });
  });

  describe("DELETE /comments/:id", () => {
    it("allows the owner to delete their comment (204)", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const commenter = await createUser();
      const post = await createPost(author.id);
      const comment = await createComment(commenter.id, post.id);

      const res = await api
        .delete(`/comments/${comment.id}`)
        .set(makeAuthHeader(commenter));

      expect(res.status).toBe(204);
    });

    it("allows an author to delete someone else's comment (204)", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const commenter = await createUser();
      const post = await createPost(author.id);
      const comment = await createComment(commenter.id, post.id);

      const res = await api
        .delete(`/comments/${comment.id}`)
        .set(makeAuthHeader(author));

      expect(res.status).toBe(204);
    });

    it("blocks a regular non-owner from deleting (403)", async () => {
      const author = await createUser({ role: Role.AUTHOR });
      const owner = await createUser();
      const intruder = await createUser();
      const post = await createPost(author.id);
      const comment = await createComment(owner.id, post.id);

      const res = await api
        .delete(`/comments/${comment.id}`)
        .set(makeAuthHeader(intruder));

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: "You are not allowed to delete this comment",
      });
    });

    it("returns 404 for a missing comment", async () => {
      const commenter = await createUser();

      const res = await api
        .delete("/comments/999999")
        .set(makeAuthHeader(commenter));

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Comment not found" });
    });

    it("returns 401 without a token", async () => {
      const res = await api.delete("/comments/1");

      expect(res.status).toBe(401);
    });
  });
});

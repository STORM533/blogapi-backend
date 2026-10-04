import { beforeEach, describe, expect, it } from "vitest";
import { Role } from "../../src/generated/prisma/client.js";
import prisma from "../../src/lib/prisma.js";
import api from "../helpers/api.js";
import { makeAuthHeader } from "../helpers/auth.js";
import { resetDb } from "../helpers/db.js";
import { createComment, createPost, createUser } from "../helpers/factories.js";

describe("posts", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const signupAuthor = async () => {
    return createUser({ role: Role.AUTHOR });
  };

  describe("GET /posts", () => {
    it("returns only published posts to guests", async () => {
      const author = await signupAuthor();
      await createPost(author.id, { title: "Published" });
      await createPost(author.id, { title: "Draft", published: false });

      const res = await api.get("/posts");

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(1);
      expect(res.body.posts[0].title).toBe("Published");
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("includes drafts for authenticated authors", async () => {
      const author = await signupAuthor();
      await createPost(author.id, { title: "Published" });
      await createPost(author.id, { title: "Draft", published: false });

      const res = await api.get("/posts").set(makeAuthHeader(author));

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it("rejects an invalid page parameter", async () => {
      const res = await api.get("/posts?page=0");

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "page", message: "Page must be a positive integer" },
      ]);
    });

    it("rejects a limit above 50", async () => {
      const res = await api.get("/posts?limit=51");

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "limit", message: "Limit must be between 1 and 50" },
      ]);
    });

    it("paginates results", async () => {
      const author = await signupAuthor();
      for (let i = 1; i <= 3; i++) {
        await createPost(author.id, { title: `Post ${i}` });
      }

      const res = await api.get("/posts?page=2&limit=2");

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(1);
      expect(res.body.pagination).toEqual({
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
      });
    });
  });

  describe("GET /posts/:id", () => {
    it("returns a published post with author, comments, and comment count", async () => {
      const author = await signupAuthor();
      const commenter = await createUser();
      const post = await createPost(author.id, { title: "Visible" });
      await createComment(commenter.id, post.id, { content: "Nice" });

      const res = await api.get(`/posts/${post.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: post.id,
        title: "Visible",
        published: true,
        author: { id: author.id, username: author.username },
        _count: { comments: 1 },
      });
      expect(res.body.comments).toHaveLength(1);
      expect(res.body.comments[0]).toMatchObject({
        content: "Nice",
        user: { id: commenter.id, username: commenter.username },
      });
    });

    it("hides unpublished posts from guests with 404", async () => {
      const author = await signupAuthor();
      const post = await createPost(author.id, { published: false });

      const res = await api.get(`/posts/${post.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Post not found" });
    });

    it("hides unpublished posts from regular users with 404", async () => {
      const author = await signupAuthor();
      const user = await createUser();
      const post = await createPost(author.id, { published: false });

      const res = await api.get(`/posts/${post.id}`).set(makeAuthHeader(user));

      expect(res.status).toBe(404);
    });

    it("shows unpublished posts to authors", async () => {
      const author = await signupAuthor();
      const otherAuthor = await createUser({ role: Role.AUTHOR });
      const post = await createPost(author.id, { published: false });

      const res = await api
        .get(`/posts/${post.id}`)
        .set(makeAuthHeader(otherAuthor));

      expect(res.status).toBe(200);
      expect(res.body.published).toBe(false);
    });

    it("rejects a non-numeric id", async () => {
      const res = await api.get("/posts/abc");

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "id", message: "ID must be a positive integer" },
      ]);
    });

    it("returns 404 for a missing post", async () => {
      const res = await api.get("/posts/999999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Post not found" });
    });
  });

  describe("POST /posts", () => {
    const validBody = { title: "New post", content: "Fresh content" };

    it("returns 401 without a token", async () => {
      const res = await api.post("/posts").send(validBody);

      expect(res.status).toBe(401);
    });

    it("returns 401 with an invalid token", async () => {
      const res = await api
        .post("/posts")
        .set("Authorization", "Bearer not-a-real-token")
        .send(validBody);

      expect(res.status).toBe(401);
    });

    it("returns 403 for a regular user", async () => {
      const user = await createUser();

      const res = await api
        .post("/posts")
        .set(makeAuthHeader(user))
        .send(validBody);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: "Forbidden" });
    });

    it("creates a post for an author (201)", async () => {
      const author = await signupAuthor();

      const res = await api
        .post("/posts")
        .set(makeAuthHeader(author))
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(Number),
        title: "New post",
        content: "Fresh content",
        published: false,
        author: { id: author.id, username: author.username },
      });
    });

    it("rejects an empty title", async () => {
      const author = await signupAuthor();

      const res = await api
        .post("/posts")
        .set(makeAuthHeader(author))
        .send({ ...validBody, title: "   " });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "title", message: "Title is Required" },
      ]);
    });

    it("rejects a title longer than 200 characters", async () => {
      const author = await signupAuthor();

      const res = await api
        .post("/posts")
        .set(makeAuthHeader(author))
        .send({ ...validBody, title: "x".repeat(201) });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "title", message: "Title must be at most 200 characters" },
      ]);
    });

    it("rejects a non-string title", async () => {
      const author = await signupAuthor();

      const res = await api
        .post("/posts")
        .set(makeAuthHeader(author))
        .send({ ...validBody, title: 123 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "title", message: "Title must be String" },
      ]);
    });

    it("rejects empty content", async () => {
      const author = await signupAuthor();

      const res = await api
        .post("/posts")
        .set(makeAuthHeader(author))
        .send({ ...validBody, content: " " });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "content", message: "Content is Required" },
      ]);
    });
  });

  describe("PATCH /posts/:id", () => {
    it("updates title and content", async () => {
      const author = await signupAuthor();
      const post = await createPost(author.id);

      const res = await api
        .patch(`/posts/${post.id}`)
        .set(makeAuthHeader(author))
        .send({ title: "Updated", content: "Updated content" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: post.id,
        title: "Updated",
        content: "Updated content",
      });

      const dbPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(dbPost?.title).toBe("Updated");
    });

    it("rejects a request with no updatable fields", async () => {
      const author = await signupAuthor();
      const post = await createPost(author.id);

      const res = await api
        .patch(`/posts/${post.id}`)
        .set(makeAuthHeader(author))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        {
          field: "",
          message: "At least one of title, content, or published is required",
        },
      ]);
    });

    it("returns 404 for a missing post", async () => {
      const author = await signupAuthor();

      const res = await api
        .patch("/posts/999999")
        .set(makeAuthHeader(author))
        .send({ title: "Ghost" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Post not found" });
    });

    it("currently allows any AUTHOR to edit any post (no ownership rule)", async () => {
      const owner = await signupAuthor();
      const otherAuthor = await signupAuthor();
      const post = await createPost(owner.id);

      const res = await api
        .patch(`/posts/${post.id}`)
        .set(makeAuthHeader(otherAuthor))
        .send({ title: "Edited by someone else" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Edited by someone else");
    });

    it("returns 403 for a regular user", async () => {
      const author = await signupAuthor();
      const user = await createUser();
      const post = await createPost(author.id);

      const res = await api
        .patch(`/posts/${post.id}`)
        .set(makeAuthHeader(user))
        .send({ title: "Nope" });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /posts/:id/publish", () => {
    it("toggles published to true", async () => {
      const author = await signupAuthor();
      const post = await createPost(author.id, { published: false });

      const res = await api
        .patch(`/posts/${post.id}/publish`)
        .set(makeAuthHeader(author))
        .send({ published: true });

      expect(res.status).toBe(200);
      expect(res.body.published).toBe(true);
    });

    it("toggles published to false", async () => {
      const author = await signupAuthor();
      const post = await createPost(author.id, { published: true });

      const res = await api
        .patch(`/posts/${post.id}/publish`)
        .set(makeAuthHeader(author))
        .send({ published: false });

      expect(res.status).toBe(200);
      expect(res.body.published).toBe(false);
    });

    it("rejects a non-boolean published value", async () => {
      const author = await signupAuthor();
      const post = await createPost(author.id);

      const res = await api
        .patch(`/posts/${post.id}/publish`)
        .set(makeAuthHeader(author))
        .send({ published: "yes" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "published", message: "Published must be a boolean" },
      ]);
    });
  });

  describe("DELETE /posts/:id", () => {
    it("deletes the post with 204", async () => {
      const author = await signupAuthor();
      const post = await createPost(author.id);

      const res = await api
        .delete(`/posts/${post.id}`)
        .set(makeAuthHeader(author));

      expect(res.status).toBe(204);

      const dbPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(dbPost).toBeNull();
    });

    it("cascades deletion to the post's comments", async () => {
      const author = await signupAuthor();
      const commenter = await createUser();
      const post = await createPost(author.id);
      const comment = await createComment(commenter.id, post.id);

      await api.delete(`/posts/${post.id}`).set(makeAuthHeader(author));

      const dbComment = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(dbComment).toBeNull();
    });

    it("returns 404 for a missing post", async () => {
      const author = await signupAuthor();

      const res = await api.delete("/posts/999999").set(makeAuthHeader(author));

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Post not found" });
    });

    it("returns 403 for a regular user", async () => {
      const author = await signupAuthor();
      const user = await createUser();
      const post = await createPost(author.id);

      const res = await api
        .delete(`/posts/${post.id}`)
        .set(makeAuthHeader(user));

      expect(res.status).toBe(403);
    });
  });

  describe("GET /posts/stats", () => {
    it("returns 401 without a token", async () => {
      const res = await api.get("/posts/stats");

      expect(res.status).toBe(401);
    });

    it("returns 403 for a regular user", async () => {
      const user = await createUser();

      const res = await api.get("/posts/stats").set(makeAuthHeader(user));

      expect(res.status).toBe(403);
    });

    it("returns stats for an author", async () => {
      const author = await signupAuthor();
      const commenter = await createUser();
      await createPost(author.id, { title: "One", published: true });
      await createPost(author.id, { title: "Two", published: false });
      const post = await createPost(author.id, {
        title: "Three",
        published: true,
      });
      await createComment(commenter.id, post.id);

      const res = await api.get("/posts/stats").set(makeAuthHeader(author));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalPosts: 3,
        publishedPosts: 2,
        draftPosts: 1,
        totalComments: 1,
      });
    });
  });
});

import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";
import api from "../helpers/api.js";
import { resetDb } from "../helpers/db.js";
import {
  TEST_PASSWORD,
  createUser,
  type TestUser,
} from "../helpers/factories.js";

describe("auth", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("POST /auth/signup", () => {
    it("creates a user and returns 201 without the password", async () => {
      const res = await api.post("/auth/signup").send({
        username: "frodo",
        email: "frodo@example.com",
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        username: "frodo",
        email: "frodo@example.com",
        role: "USER",
      });
      expect(res.body).not.toHaveProperty("password");
    });

    it("rejects a duplicate username with 409", async () => {
      await createUser({ username: "frodo" });

      const res = await api.post("/auth/signup").send({
        username: "frodo",
        email: "other@example.com",
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        message: "Username or email already exists",
      });
    });

    it("rejects a duplicate email with 409", async () => {
      await createUser({ email: "frodo@example.com" });

      const res = await api.post("/auth/signup").send({
        username: "sam",
        email: "frodo@example.com",
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        message: "Username or email already exists",
      });
    });

    it("rejects a password shorter than 8 characters", async () => {
      const res = await api.post("/auth/signup").send({
        username: "frodo",
        email: "frodo@example.com",
        password: "short",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        {
          field: "password",
          message: "Password must be at least 8 characters",
        },
      ]);
    });

    it("rejects an invalid email", async () => {
      const res = await api.post("/auth/signup").send({
        username: "frodo",
        email: "not-an-email",
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "email", message: "Invalid email" },
      ]);
    });

    it("rejects a missing username", async () => {
      const res = await api.post("/auth/signup").send({
        email: "frodo@example.com",
        password: TEST_PASSWORD,
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "username", message: "Username is required" },
      ]);
    });
  });

  describe("POST /auth/login", () => {
    const loginAs = async (user: TestUser, password = TEST_PASSWORD) => {
      return api
        .post("/auth/login")
        .send({ username: user.username, password });
    };

    it("returns a signed JWT and sets an httpOnly cookie", async () => {
      const user = await createUser({ username: "frodo" });

      const res = await loginAs(user);

      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));

      const payload = jwt.verify(res.body.token, process.env.JWT_SECRET!);
      expect(payload).toMatchObject({ userId: user.id, role: "USER" });

      const cookie = res.headers["set-cookie"];
      expect(cookie).toBeDefined();
      expect(String(cookie)).toContain("token=");
      expect(String(cookie)).toContain("HttpOnly");
    });

    it("rejects a wrong password with 401", async () => {
      const user = await createUser({ username: "frodo" });

      const res = await loginAs(user, "wrong-password");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Invalid credentials" });
    });

    it("rejects an unknown username with 401", async () => {
      const res = await api
        .post("/auth/login")
        .send({ username: "nobody", password: TEST_PASSWORD });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Invalid credentials" });
    });

    it("rejects missing credentials with 400", async () => {
      const res = await api.post("/auth/login").send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "username", message: "Username is required" },
        { field: "password", message: "Password is required" },
      ]);
    });
  });

  describe("POST /auth/logout", () => {
    it("clears the token cookie", async () => {
      const res = await api.post("/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Logged out" });
      const cookie = String(res.headers["set-cookie"]);
      expect(cookie).toContain("token=;");
      expect(cookie).toContain("Expires=Thu, 01 Jan 1970");
    });
  });
});

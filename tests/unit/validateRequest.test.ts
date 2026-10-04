import express from "express";
import { body } from "express-validator";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { validateRequest } from "../../src/middleware/validateRequest.js";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.post(
    "/thing",
    body("name").notEmpty().withMessage("Name is required"),
    validateRequest,
    (_req, res) => {
      res.status(200).json({ ok: true });
    },
  );
  return app;
};

describe("validateRequest", () => {
  it("calls next when validation passes", async () => {
    const res = await request(buildApp())
      .post("/thing")
      .send({ name: "frodo" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("responds 400 with formatted field errors when validation fails", async () => {
    const res = await request(buildApp()).post("/thing").send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      errors: [{ field: "name", message: "Name is required" }],
    });
  });

  it("collects multiple field errors", async () => {
    const app = express();
    app.use(express.json());
    app.post(
      "/multi",
      body("a").notEmpty().withMessage("A is required"),
      body("b").notEmpty().withMessage("B is required"),
      validateRequest,
      (_req, res) => {
        res.status(200).json({ ok: true });
      },
    );

    const res = await request(app).post("/multi").send({ a: "", b: "" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(2);
    expect(res.body.errors.map((e: { field: string }) => e.field)).toEqual([
      "a",
      "b",
    ]);
  });
});

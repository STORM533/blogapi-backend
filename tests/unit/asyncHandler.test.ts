import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "../../src/middleware/asyncHandler.js";

const req = {} as Request;
const res = {} as Response;

describe("asyncHandler", () => {
  it("forwards a rejected promise to next", async () => {
    const error = new Error("boom");
    const next = vi.fn() as NextFunction;
    const handler = asyncHandler(async () => {
      throw error;
    });

    handler(req, res, next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });

  it("does not call next when the handler succeeds", async () => {
    const next = vi.fn() as NextFunction;
    const handler = asyncHandler(async (_req, res) => {
      res.statusCode = 200;
    });

    handler(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards errors thrown after an await", async () => {
    const error = new Error("late failure");
    const next = vi.fn() as NextFunction;
    const handler = asyncHandler(async () => {
      await Promise.resolve();
      throw error;
    });

    handler(req, res, next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});

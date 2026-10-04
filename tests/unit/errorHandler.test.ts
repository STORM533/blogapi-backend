import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/errors/AppError.js";
import { Prisma } from "../../src/generated/prisma/client.js";
import errorHandler from "../../src/middleware/errorHandler.js";

const makeRes = (headersSent = false) => {
  const res = {
    headersSent,
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
};

const req = {} as Request;

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("prisma failure", {
    code,
    clientVersion: "7.10.0",
  });

describe("errorHandler", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("maps AppError to its status code and message", () => {
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    errorHandler(new AppError("Post not found", 404), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("maps Prisma P2002 to 409", () => {
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    errorHandler(prismaError("P2002"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "A record with this value already exists",
    });
  });

  it("maps Prisma P2025 to 404", () => {
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    errorHandler(prismaError("P2025"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Record not found" });
  });

  it("maps Prisma P2003 to 400", () => {
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    errorHandler(prismaError("P2003"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid related record",
    });
  });

  it("maps unknown errors to 500 and logs them", () => {
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    errorHandler(new Error("unexpected"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
    expect(console.error).toHaveBeenCalled();
  });

  it("delegates to next when headers were already sent", () => {
    const res = makeRes(true);
    const next = vi.fn() as NextFunction;
    const error = new AppError("too late", 500);

    errorHandler(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

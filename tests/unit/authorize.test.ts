import { describe, expect, it, vi } from "vitest";
import { Role } from "../../src/generated/prisma/client.js";
import { requireRole } from "../../src/middleware/authorize.js";
import type { NextFunction, Request, Response } from "express";

const makeRes = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
};

describe("requireRole", () => {
  it("returns 401 when there is no authenticated user", () => {
    const middleware = requireRole(Role.AUTHOR);
    const req = { user: undefined } as unknown as Request;
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Authentication required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when the user has the wrong role", () => {
    const middleware = requireRole(Role.AUTHOR);
    const req = { user: { id: 1, role: Role.USER } } as unknown as Request;
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when the user has the required role", () => {
    const middleware = requireRole(Role.AUTHOR);
    const req = { user: { id: 1, role: Role.AUTHOR } } as unknown as Request;
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});

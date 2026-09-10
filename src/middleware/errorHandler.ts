import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        res.status(409).json({
          message: "A record with this value already exists",
        });
        return;

      case "P2025":
        res.status(404).json({
          message: "Record not found",
        });
        return;

      case "P2003":
        res.status(400).json({
          message: "Invalid related record",
        });
        return;
    }
  }

  console.error(err);

  res.status(500).json({
    message: "Internal Server Error",
  });
};

export default errorHandler;

import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError.js";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("ERROR HANDLER REACHED:", err);
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
    });

    return;
  }

  console.error(err);

  res.status(500).json({
    message: "Internal Server Error",
  });
};

export default errorHandler;

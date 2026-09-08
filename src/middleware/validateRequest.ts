import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors
      .formatWith((errors) => ({
        field: "path" in errors ? errors.path : undefined,
        message: errors.msg,
      }))
      .array();
    return res.status(400).json({ errors: formattedErrors });
  }
  next();
};
export { validateRequest };

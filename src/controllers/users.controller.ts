import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

import {
  getCurrentUser as getCurrentUserService,
  getCommentsByUserId,
} from "../services/users.service.js";

import type { MeCommentsQuery } from "../types/users.js";

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await getCurrentUserService(userId);

  res.json(user);
};

export const getMyComments = async (
  req: Request<ParamsDictionary, object, object, MeCommentsQuery>,
  res: Response,
) => {
  const userId = req.user!.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await getCommentsByUserId(userId, page, limit);

  res.json(result);
};

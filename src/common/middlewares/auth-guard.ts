import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { IPayload } from "../types/types";
import { prisma } from "../prisma/prisma";

export const authGuard =
  () => async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "token not found" });
    }

    let payload: IPayload;
    try {
      payload = jwt.verify(token, env.jwt.accessToken as string) as IPayload;
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
    if (!payload?.userId) {
      return res.status(401).json({ error: "token invalid" });
    }

    const user = await prisma.users.findFirst({
      where: { id: payload.userId },
    });
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }

    req.userId = payload.userId;
    return next();
  };

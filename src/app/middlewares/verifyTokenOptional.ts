import { type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { requireEnv } from "../config/env.js";
import { type Role } from "@prisma/client";

type JwtPayload = {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
};

const verifyTokenOptional: RequestHandler = (req, _res, next) => {
  const cookieToken = req.cookies?.accessToken;
  const token = cookieToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, requireEnv("JWT_SECRET")) as JwtPayload;

    if (decoded?.userId && decoded?.role) {
      req.user = { userId: decoded.userId, role: decoded.role };
    }

    return next();
  } catch {
    return next();
  }
};

export default verifyTokenOptional;

import { type RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { type Role } from "../../generated/prisma/enums";

type JwtPayload = {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
};

const verifyToken: RequestHandler = (req, _res, next) => {
  const cookieToken = req.cookies?.accessToken;
  const token = cookieToken;

  if (!token) {
    return next(new AppError(StatusCodes.UNAUTHORIZED, "Token is missing"));
  }


  try {
    const decoded = jwt.verify(token, envVars.JWT_SECRET) as JwtPayload;

    if (!decoded?.userId || !decoded?.role) {

      return next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token"));

    }

    req.user = { userId: decoded.userId, role: decoded.role };

    return next();

  } catch {

    return next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));

  }
};

export default verifyToken;

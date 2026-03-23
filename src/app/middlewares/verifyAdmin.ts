import { type RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errorHelpers/AppError.js";

const verifyAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
  }

  if (req.user.role !== "ADMIN") {
    return next(new AppError(StatusCodes.FORBIDDEN, "Admin access required"));
  }

  return next();
};

export default verifyAdmin;

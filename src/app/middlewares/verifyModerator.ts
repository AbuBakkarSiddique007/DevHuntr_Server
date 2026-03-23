import { type RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errorHelpers/AppError.js";

const verifyModerator: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
  }

  if (req.user.role !== "MODERATOR" && req.user.role !== "ADMIN") {
    return next(new AppError(StatusCodes.FORBIDDEN, "Moderator access required"));
  }

  return next();
};

export default verifyModerator;

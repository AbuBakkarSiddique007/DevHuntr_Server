import { type ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { getEnvVars } from "../config/env.js";
import AppError from "../errorHelpers/AppError.js";

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    void _next;

    const isProd = getEnvVars().NODE_ENV === "production";

    if (err instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation error",
            errors: err.issues,
        });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Duplicate value violates unique constraint",
            });
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Database request error",
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Something went wrong",
        error: isProd ? undefined : err instanceof Error ? err.message : "Unknown error",
        stack: isProd ? undefined : err instanceof Error ? err.stack : undefined,
    });
};

export default globalErrorHandler;

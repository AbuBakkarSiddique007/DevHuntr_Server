import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const notFound = (req: Request, res: Response) => {

    return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Route ${req.originalUrl} Not Found`,
    });
};
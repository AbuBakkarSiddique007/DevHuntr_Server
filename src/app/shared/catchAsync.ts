import { NextFunction, Request, RequestHandler, Response } from "express"

const catchAsync = (fn: RequestHandler) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve Data",
                error: error instanceof Error ? error.message : "Data retrieval failed"
            })
        }
    }
}

export default catchAsync;
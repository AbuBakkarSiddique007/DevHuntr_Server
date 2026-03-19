import { type RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { type ZodTypeAny } from "zod";
import AppError from "../errorHelpers/AppError";

type RequestValidationSchema = {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
};

type ValidateSchema = ZodTypeAny | RequestValidationSchema;

const isZodSchema = (value: ValidateSchema): value is ZodTypeAny =>
    typeof (value as ZodTypeAny).safeParse === "function";

const unwrapBodyData = (body: unknown): unknown => {
    if (!body || typeof body !== "object") return body;

    const record = body as Record<string, unknown>;
    if (Object.keys(record).length !== 1 || typeof record.data !== "string") return body;

    try {
        return JSON.parse(record.data);
    } catch {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid JSON in body.data");
    }
};

const validateRequest = (schema: ValidateSchema): RequestHandler => {
    return (req, _res, next) => {
        try {
            const schemas: RequestValidationSchema = isZodSchema(schema) ? { body: schema } : schema;

            if (schemas.body) {
                const bodyResult = schemas.body.safeParse(unwrapBodyData(req.body ?? {}));
                if (!bodyResult.success) return next(bodyResult.error);

                req.body = bodyResult.data;
            }

            if (schemas.query) {
                const queryResult = schemas.query.safeParse(req.query);

                if (!queryResult.success) return next(queryResult.error);

                if (req.query && typeof req.query === "object") {
                    Object.assign(req.query as Record<string, unknown>, queryResult.data as Record<string, unknown>);
                }
            }

            if (schemas.params) {
                const paramsResult = schemas.params.safeParse(req.params);

                if (!paramsResult.success) return next(paramsResult.error);

                if (req.params && typeof req.params === "object") {
                    Object.assign(req.params as Record<string, unknown>, paramsResult.data as Record<string, unknown>);
                }
            }

            return next();
        } catch (error) {
            return next(error);
        }
    };
};

export default validateRequest;

import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { IndexRoutes } from "./app/routes";
import { notFound } from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { envVars } from "./app/config/env";
import AppError from "./app/errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";

const app: Application = express();

const allowedOrigins = [envVars.CLIENT_URL, "http://localhost:3000"].filter(Boolean) as string[];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new AppError(StatusCodes.FORBIDDEN, "Not allowed by CORS"));
        },
        credentials: true,
    }),
);

// Cookies:
app.use(cookieParser());

// Body parsers:
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes:
app.use("/api/v1", IndexRoutes);


// Health check:
app.get("/", (req: Request, res: Response) => {
    res.send("Hello World, DevHuntr Server is running");
});



// Handle not found routes and global errors:
app.use(notFound);
app.use(globalErrorHandler);

export default app;
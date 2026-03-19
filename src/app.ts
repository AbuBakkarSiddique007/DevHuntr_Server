import express, { Application, Request, Response } from "express";
import cors from "cors";
import { IndexRoutes } from "./app/routes";
import { notFound } from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();

// CORS:
app.use(cors());

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
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

import routes from "./routes/index.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (process.env.NODE_ENV !== "production") return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(morgan("dev"));

// Health check endpoints for uptime monitoring and container probes
const healthHandler = (_req: express.Request, res: express.Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: isDbConnected ? "connected" : "disconnected",
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
    });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
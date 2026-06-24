import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import swaggerDocument from "../swagger.json" with { type: "json" };
import { RegisterRoutes } from "./generated/routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ipBannedHandler } from "./middlewares/ipBanned.middleware.js";
import { loggerHandler } from "./middlewares/logger.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { bootstrap } from "./start/bootstrap.js";
import { ApiResponse } from "./utils/apiResponse.js";

dotenv.config({ quiet: true });

await bootstrap();

const trustProxy = process.env.TRUST_PROXY === "true";

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Max 200 requests per IP
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: { trustProxy },

    handler: (_req, res, _next, options) => {
        return res
            .status(options.statusCode)
            .json(
                ApiResponse.error(
                    "Too Many Requests",
                    "You have exceeded the limit of allowed requests. Please try again later."
                )
            );
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 requests per IP
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: { trustProxy },

    handler: (_req, res, _next, options) => {
        return res
            .status(options.statusCode)
            .json(
                ApiResponse.error(
                    "Too Many Requests",
                    "You have exceeded the limit of allowed requests. Please try again later."
                )
            );
    },
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 requests per IP
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: { trustProxy },

    handler: (_req, res, _next, options) => {
        return res
            .status(options.statusCode)
            .json(
                ApiResponse.error(
                    "Too Many Requests",
                    "You have exceeded the limit of allowed requests. Please try again later."
                )
            );
    },
});

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(loggerHandler);

app.use(ipBannedHandler);

app.use(globalLimiter);
app.use("/auth/register", authLimiter);
app.use("/admin/login", adminLimiter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
RegisterRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

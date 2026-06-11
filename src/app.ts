import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import pc from 'picocolors';

import swaggerDocument from "../swagger-output.json" with { type: "json" };
import { errorHandler } from "./middlewares/error.middleware.js";
import { loggerHandler } from "./middlewares/logger.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { ApiResponse } from "./utils/apiResponse.js";
import routes from "./routes/index.route.js";


dotenv.config({ quiet: true });
const port = process.env.SERVER_PORT || 3000;

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                 // Max 200 requests per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { trustProxy: false }, 

    handler: (req, res, next, options) => {
        return ApiResponse.error(res, 
            "Too Many Requests",
            "You have exceeded the limit of allowed requests. Please try again later.", 
            options.statusCode
        );
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                  // Max 5 requests per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { trustProxy: false }, 

    handler: (req, res, next, options) => {
        return ApiResponse.error(res, 
            "Too Many Requests",
            "You have exceeded the limit of allowed requests. Please try again later.", 
            options.statusCode
        );
    }
});


const app = express();
app.set('trust proxy', true);

app.use(express.json());
app.use(loggerHandler);

app.use(globalLimiter);
app.use("/auth/register", authLimiter);


app.use("/docs/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use("/", routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(pc.green(`Server started at http://localhost:${port}`));
});

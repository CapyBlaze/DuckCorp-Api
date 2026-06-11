import type { ErrorRequestHandler } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import pc from 'picocolors';


export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(
        `${pc.red(pc.bold('Encountered error:'))} ${pc.white(err.message)}`
    );

    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        return res.status(400).json(
            ApiResponse.error(
                "Bad Request", 
                "The JSON format sent is invalid."
            )
        );
    }

    if (err instanceof TypeError && err.message.includes("Cannot destructure property")) {
        return res.status(400).json(
            ApiResponse.error(
                "Bad Request", 
                "The request body is unreadable or empty.", 
            )
        );
    }

    return res.status(err.status || 500).json(
        ApiResponse.error(
            "Internal Server Error", 
            "An internal error occurred on the server."
        )
    );
};

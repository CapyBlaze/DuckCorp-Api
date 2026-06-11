import type { ErrorRequestHandler } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import pc from 'picocolors';


export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(
        `${pc.red(pc.bold('Encountered error:'))} ${pc.white(err.message)}`
    );

    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        return ApiResponse.error(res, 
            "Bad Request", 
            "The JSON format sent is invalid.", 
            400
        );
    }

    if (err instanceof TypeError && err.message.includes("Cannot destructure property")) {
        return ApiResponse.error(res, 
            "Bad Request", 
            "The request body is unreadable or empty.", 
            400
        );
    }

    return ApiResponse.error(res, 
        "Internal Server Error", 
        "An internal error occurred on the server.", 
        err.status || 500
    );
};

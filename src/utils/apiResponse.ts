export interface ApiResponseFormat<T = any> {
    success: boolean;
    status: number;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}

export class ApiResponse {
    static success<T>(res: any, message: string, data: T = null as any, status = 200) {
        const response: ApiResponseFormat = {
            success: true,
            status,
            message,
            data: data ?? undefined,
            timestamp: new Date().toISOString(),
        };
        return res.status(status).json(response);
    }

    static failure<T>(res: any, message: string, data: T = null as any, status = 200) {
        const response: ApiResponseFormat = {
            success: false,
            status,
            message,
            data: data ?? undefined,
            timestamp: new Date().toISOString(),
        };
        return res.status(status).json(response);
    }

    static error(res: any, errorName = "Internal Server Error", message: string, status = 500) {
        const response: ApiResponseFormat = {
            success: false,
            status,
            error: errorName,
            message,
            timestamp: new Date().toISOString(),
        };
        return res.status(status).json(response);
    }
}

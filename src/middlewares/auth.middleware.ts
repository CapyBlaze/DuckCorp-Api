import type { Request } from "express";
import { prisma } from "../prisma.js";

import { adminSessions } from "../services/admin.service.js";
import { HttpError } from "./error.middleware.js";

export async function expressAuthentication(request: Request, securityName: string): Promise<any> {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        throw new HttpError(401, "Missing Token", "Token is missing");
    }

    switch (securityName) {
        case "playerAuth": {
            const user = await prisma.player.findUnique({
                where: { token },
            });

            if (!user) {
                throw new HttpError(401, "Invalid Token", "Token does not match any user");
            }

            if (!user.active) {
                throw new HttpError(403, "User Inactive", "User is inactive");
            }

            return user;
        }

        case "adminAuth": {
            const session = adminSessions.get(token);

            if (!session) {
                throw new HttpError(401, "Invalid Token", "Token does not match any admin session");
            }

            if (session.expiresAt < new Date()) {
                adminSessions.delete(token);
                throw new HttpError(401, "Session Expired", "Admin session has expired");
            }

            return {
                type: "admin",
                createdAt: session.createdAt,
                expiresAt: session.expiresAt,
            };
        }

        default: {
            throw new HttpError(500, "Unknown Security Scheme", "Unknown security scheme");
        }
    }
}

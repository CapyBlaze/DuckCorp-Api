import type { Request } from "express";
import { prisma } from "../prisma.js";

export async function expressAuthentication(request: Request, securityName: string): Promise<any> {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        throw { status: 401, message: "Missing token" };
    }

    const user = await prisma.player.findUnique({
        where: { token }
    });

    if (!user) {
        throw { status: 401, message: "Invalid token" };
    }

    if (!user.active) {
        throw { status: 403, message: "User is inactive" };
    }

    return user;
}
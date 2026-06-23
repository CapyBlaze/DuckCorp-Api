import { prisma } from "../prisma.js";

export async function initWorld() {
    await prisma.worldState.upsert({
        where: {
            id: 1,
        },
        update: {},
        create: {
            id: 1,
        },
    });
}

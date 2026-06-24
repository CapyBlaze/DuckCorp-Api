import { Player } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: Player;
        }
    }
}

export interface AuthenticatedRequest extends Express.Request {
    user: Player;
}

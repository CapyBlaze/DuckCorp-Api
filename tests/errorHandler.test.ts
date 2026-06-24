import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { errorHandler } from "../src/middlewares/error.middleware.js";

describe("errorHandler", () => {
    it("doit renvoyer un statut 500 et le message d'erreur", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        const error = new Error("Une erreur TSOA est survenue");
        const req = {} as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn();

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Internal Server Error",
            message: "An internal error occurred on the server.",
            timestamp: expect.any(String),
        });
    });
});

import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { BadRequestError, HttpError } from "../errors.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.format(),
      },
    });
    return;
  }

  if (err instanceof HttpError) {
    const payload: { code: string; message: string; details?: unknown } = {
      code: err.code,
      message: err.message,
    };
    if (err instanceof BadRequestError && err.details !== undefined) {
      payload.details = err.details;
    }
    res.status(err.status).json({ error: payload });
    return;
  }

  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: { code: "INTERNAL", message: "Internal server error" } });
}

import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    res.locals.query = parsed.data;
    next();
  };
}

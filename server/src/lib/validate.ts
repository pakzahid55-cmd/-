import type { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

/** Validate request body against a zod schema, replacing it with parsed output. */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: e.issues.map((err) => ({ field: err.path.join("."), message: err.message })),
        });
        return;
      }
      next(e);
    }
  };
}

/** Wrap async route handlers so errors reach the error middleware. */
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
}

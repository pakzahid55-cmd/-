import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res, next).catch(next); };

export function parseBody<T>(schema: ZodSchema<T>, req: Request, res: Response): T | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid input', details: result.error.flatten() });
    return null;
  }
  return result.data;
}

export const escapeLike = (s: string) => s.replace(/[%_\\]/g, m => '\\' + m);

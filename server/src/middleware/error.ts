import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Resource not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Body-parser / express errors carry a status (e.g. malformed JSON → 400).
  const e = err as { statusCode?: number; status?: number; type?: string; message?: string };
  const status = e?.statusCode ?? e?.status ?? 500;
  if (status >= 400 && status < 500) {
    res.status(status).json({ error: e?.type === "entity.parse.failed" ? "Invalid JSON body" : (e?.message ?? "Bad request") });
    return;
  }
  console.error("[kajok-server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}

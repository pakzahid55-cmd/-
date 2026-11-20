import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Resource not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) { next(err); return; }
  const code = (err as { code?: string | number })?.code;
  if (code === 6 || code === "23505") { res.status(409).json({ error: "Record already exists" }); return; }
  if (code === "LIMIT_FILE_SIZE") { res.status(413).json({ error: "File is too large" }); return; }
  if (String(code).startsWith("LIMIT_")) { res.status(400).json({ error: "Invalid upload" }); return; }
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
  console.error("[kujuk-server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}

import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";
import type { Role, User } from "../db/types.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authentication guard. Authorization is enforced server-side only —
 * never rely on frontend checks to protect data or admin functions.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  void req.app.locals.store
    .findUserById(payload.sub)
    .then((user: User | null) => {
      if (!user) {
        res.status(401).json({ error: "User no longer exists" });
        return;
      }
      req.user = user;
      next();
    })
    .catch(next);
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const check = (): void => {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }
      next();
    };
    // Runs authentication first when used standalone (e.g. requireSeller).
    if (req.user) check();
    else requireAuth(req, res, check);
  };
}

export const requireAdmin = requireRole("admin");
export const requireSeller = requireRole("seller", "admin");

export function toPublicUser(user: User) {
  const { passwordHash: _ph, ...publicUser } = user;
  return publicUser;
}

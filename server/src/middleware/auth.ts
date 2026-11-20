import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";
import { env } from '../config/env.js';
import { verifyFirebaseIdToken } from '../lib/firebase-token.js';
import type { Store } from '../db/store.js';
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
  const store: Store = req.app.locals.store;
  void (async () => {
    if (process.env.FIREBASE_PROJECT_ID) {
      const identity = await verifyFirebaseIdToken(token);
      const user = await store.findUserByFirebaseUid(identity.uid);
      if (!user) { res.status(401).json({ error: 'Complete account setup first' }); return; }
      if (user.role === 'admin' && (!identity.emailVerified || (env.superAdminUid && identity.uid !== env.superAdminUid))) {
        res.status(403).json({ error: 'Administrator identity is not authorized' }); return;
      }
      req.user = user;
      next();
      return;
    }
    const payload = verifyToken(token);
    const user = payload ? await store.findUserById(payload.sub) : null;
    if (!user) { res.status(401).json({ error: 'Invalid session' }); return; }
    req.user = user;
    next();
  })().catch(next);
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

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'kajok-dev-secret-change-in-production-2026';

export interface AuthUser { id: number; email: string; role: 'customer' | 'admin'; full_name: string }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: AuthUser } }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, full_name: user.full_name }, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please sign in first' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser & { role: 'customer' | 'admin' };
    req.user = { id: payload.id, email: payload.email, role: payload.role, full_name: payload.full_name };
    next();
  } catch {
    return res.status(401).json({ error: 'TOKEN_INVALID', message: 'Session expired, please sign in again' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Administrator access required' });
    }
    next();
  });
}

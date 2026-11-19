import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "../db/types.js";

export interface TokenPayload {
  sub: number;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as unknown as TokenPayload;
  } catch {
    return null;
  }
}

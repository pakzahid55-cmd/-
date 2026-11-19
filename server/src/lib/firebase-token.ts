import jwt from "jsonwebtoken";
import { HttpError } from "../middleware/error.js";

/**
 * Verify Firebase Authentication ID tokens using Google's public x509 certs.
 * No service-account secrets are needed for verification — the token is
 * validated against Google's published keys and this project's ID.
 */
const PROJECT_ID = "kajok-65089";
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;
const CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certs: Record<string, string> | null = null;
let certsFetchedAt = 0;

async function getCert(kid: string): Promise<string> {
  if (!certs || Date.now() - certsFetchedAt > 60 * 60 * 1000) {
    const res = await fetch(CERTS_URL);
    if (!res.ok) throw new HttpError(503, "Could not fetch Firebase verification keys");
    certs = (await res.json()) as Record<string, string>;
    certsFetchedAt = Date.now();
  }
  const pem = certs[kid];
  if (!pem) throw new HttpError(401, "Unknown Firebase token signing key");
  return pem;
}

export interface FirebaseIdentity {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  phone: string | null;
  emailVerified: boolean;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseIdentity> {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || typeof decoded === "string" || !decoded.header.kid) {
    throw new HttpError(400, "Invalid Firebase ID token");
  }
  const pem = await getCert(decoded.header.kid);
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(idToken, pem, { algorithms: ["RS256"] }) as jwt.JwtPayload;
  } catch {
    throw new HttpError(401, "Firebase ID token is invalid or expired");
  }
  if (payload.aud !== PROJECT_ID || payload.iss !== ISSUER) {
    throw new HttpError(401, "Firebase ID token was not issued for this project");
  }
  return {
    uid: String(payload.sub ?? ""),
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
    phone: typeof payload.phone_number === "string" ? payload.phone_number : null,
    emailVerified: payload.email_verified === true,
  };
}

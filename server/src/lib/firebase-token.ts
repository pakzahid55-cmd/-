import { firebaseAdminAuth } from './firebase-admin.js';
import { HttpError } from '../middleware/error.js';

export async function verifyFirebaseIdToken(idToken: string) {
  if (!process.env.FIREBASE_PROJECT_ID) throw new HttpError(503, 'Firebase Authentication is not configured');
  try {
    const claims = await firebaseAdminAuth().verifyIdToken(idToken, true);
    return { uid: claims.uid, email: claims.email ?? null, name: typeof claims.name === 'string' ? claims.name.slice(0, 80) : null,
      emailVerified: claims.email_verified === true, phone: claims.phone_number ?? null, picture: claims.picture ?? null };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/internal-error' || !code) throw new HttpError(503, 'Firebase verification is temporarily unavailable');
    throw new HttpError(401, 'Invalid, expired or revoked Firebase session');
  }
}

/**
 * Firebase Authentication client — Google sign-in, Phone OTP, password reset.
 * Email/password login keeps using the API (existing accounts keep working);
 * Firebase identities are exchanged for the app session via POST /api/auth/firebase.
 */
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

declare global {
  interface Window {
    _kajokRecaptcha?: RecaptchaVerifier;
  }
}

export async function sendPhoneOtp(phoneE164: string, containerId = "kajok-recaptcha"): Promise<ConfirmationResult> {
  if (!window._kajokRecaptcha) {
    window._kajokRecaptcha = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  return signInWithPhoneNumber(auth, phoneE164, window._kajokRecaptcha);
}

export async function confirmPhoneOtp(confirmation: ConfirmationResult, code: string): Promise<FirebaseUser> {
  const cred = await confirmation.confirm(code.trim());
  return cred.user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getFirebaseIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in with Firebase");
  return user.getIdToken();
}

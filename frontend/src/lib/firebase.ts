import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type ActionCodeSettings,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Prevent re-initialization during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

/** Base URL for the app (used in Firebase email action links) */
function getAppUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/** Action code settings that redirect Firebase email links to our custom handler */
function getActionCodeSettings(): ActionCodeSettings {
  return {
    url: `${getAppUrl()}/auth/action`,
    handleCodeInApp: false,
  };
}

// ─── Auth helpers ──────────────────────────────────────────

/**
 * Sign in with email/password.
 * Blocks unverified users — keeps session alive and throws auth/email-not-verified.
 */
export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  if (!cred.user.emailVerified) {
    // Re-send verification email with custom action URL
    await sendEmailVerification(cred.user, getActionCodeSettings()).catch(() => {});
    throw { code: "auth/email-not-verified" };
  }

  return cred;
}

/**
 * Create account + send verification email.
 * Keeps user signed in so /verify-email can resend/check.
 * AuthProvider will NOT sync to backend until email is verified.
 */
export async function signUp(email: string, password: string, displayName?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  await sendEmailVerification(cred.user, getActionCodeSettings());
  return cred;
}

/**
 * Send password reset email with custom action URL.
 */
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email, getActionCodeSettings());
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export { auth, onAuthStateChanged, type User };

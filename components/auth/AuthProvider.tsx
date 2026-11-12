"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

type Status = "loading" | "signedOut" | "signedIn" | "disabled";

interface AuthValue {
  status: Status;
  user: User | null;
  error: string | null;
  /** Set right after someone signs in or registers in this session, for the arrival animation. */
  arrival: Arrival | null;
  clearArrival: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Email methods resolve to an error message, or null on success. */
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
}

export interface Arrival {
  kind: "signin" | "signup";
}

const AuthContext = createContext<AuthValue | null>(null);

/** Installed iOS web apps cannot rely on popups, so they use the redirect flow. */
function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/unauthorized-domain":
      return "This domain is not authorised for sign-in yet.";
    case "auth/network-request-failed":
      return "No connection. Check your internet and try again.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/missing-password":
      return "Enter your password.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not switched on yet.";
    default:
      return `Sign-in did not work. Please try again. (${code || "unknown error"})`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(
    isFirebaseConfigured ? "loading" : "disabled",
  );
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [arrival, setArrival] = useState<Arrival | null>(null);
  // Bumped when the profile changes in place, so the name shows up right away.
  const [profileVersion, setProfileVersion] = useState(0);
  const pendingKind = useRef<Arrival["kind"] | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), (next) => {
      setUser(next);
      setStatus(next ? "signedIn" : "signedOut");
      // Only a sign-in started on this screen counts, not a restored session.
      if (next && pendingKind.current) {
        setArrival({ kind: pendingKind.current });
        pendingKind.current = null;
      }
    });
  }, []);

  const clearArrival = useCallback(() => setArrival(null), []);

  const signIn = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    setError(null);
    pendingKind.current = "signin";
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account", hl: "en" });
    try {
      if (isStandalone()) {
        await signInWithRedirect(auth, provider);
        return;
      }
      await signInWithPopup(auth, provider);
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      console.error("Sign-in failed", e);
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
        return;
      }
      const message = friendlyError(code);
      if (message) setError(message);
    }
  }, []);

  const withEmail = useCallback(
    async (action: () => Promise<unknown>): Promise<string | null> => {
      if (!isFirebaseConfigured) return "Accounts are not set up yet.";
      try {
        await action();
        return null;
      } catch (e) {
        pendingKind.current = null;
        const code = (e as { code?: string }).code ?? "";
        console.error("Email auth failed", e);
        return friendlyError(code) || "Something went wrong. Please try again.";
      }
    },
    [],
  );

  const signInWithEmail = useCallback(
    (email: string, password: string) => {
      pendingKind.current = "signin";
      return withEmail(() =>
        signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password),
      );
    },
    [withEmail],
  );

  const signUpWithEmail = useCallback(
    (email: string, password: string, name?: string) => {
      pendingKind.current = "signup";
      return withEmail(async () => {
        const cred = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        );
        const displayName = name?.trim();
        if (displayName) {
          try {
            await updateProfile(cred.user, { displayName });
            setProfileVersion((v) => v + 1);
          } catch (e) {
            // The account exists; a missing name is not worth failing the sign-up.
            console.error("Could not save the display name", e);
          }
        }
      });
    },
    [withEmail],
  );

  const resetPassword = useCallback(
    (email: string) =>
      withEmail(() => sendPasswordResetEmail(getFirebaseAuth(), email.trim())),
    [withEmail],
  );

  const signOut = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  // profileVersion is a dependency on purpose: the user object is updated in
  // place when a name is saved, so the context value must be rebuilt.
  /* eslint-disable react-hooks/exhaustive-deps */
  const value = useMemo(
    () => ({
      status,
      user,
      error,
      arrival,
      clearArrival,
      signIn,
      signOut,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
    }),
    [
      status,
      user,
      error,
      arrival,
      clearArrival,
      profileVersion,
      signIn,
      signOut,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
    ],
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { LoginScene } from "@/components/auth/LoginScene";

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

/**
 * Google sign-in is built (see AuthProvider) but hidden for now.
 * Set this to true to show the button again.
 */
const SHOW_GOOGLE = false;

type Mode = "options" | "signin" | "signup";

const inputClass =
  "h-12 w-full rounded-[16px] border border-bone/10 bg-char-800/90 px-4 text-[16px] text-bone outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-bone-faint focus:border-ochre focus:shadow-[0_0_0_4px_rgb(217_164_65/0.12)]";

const SOFT = [0.22, 0.8, 0.28, 1] as const;
const BOUNCE = { type: "spring", stiffness: 360, damping: 22, mass: 0.9 } as const;

/** Space around a field, so focus glows are not clipped while heights animate. */
function Field({ children }: { children: React.ReactNode }) {
  return <div className="-mx-2 px-2 pb-3">{children}</div>;
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-5 w-5 animate-spin rounded-full border-2 border-ink/25 border-t-ink"
    />
  );
}

function EmailForm({
  mode,
  onModeChange,
}: {
  mode: "signin" | "signup";
  onModeChange: (m: Mode) => void;
}) {
  const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const reduce = useReducedMotion();
  const shake = useAnimationControls();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  function fail(message: string) {
    setError(message);
    if (!reduce) void shake.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.45 } });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const result =
      mode === "signin"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, name);
    setBusy(false);
    if (result) fail(result);
  }

  async function forgot() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      fail("Enter your email above first.");
      return;
    }
    setBusy(true);
    const result = await resetPassword(email);
    setBusy(false);
    if (result) fail(result);
    else setNotice("If an account exists for this email, we sent a reset link.");
  }

  return (
    <form onSubmit={submit}>
      <motion.div animate={shake}>
        {SHOW_GOOGLE && (
          <button
            type="button"
            onClick={() => onModeChange("options")}
            className="-ml-1 flex h-11 items-center gap-1 text-[14px] text-bone-dim active:text-bone"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
            Other options
          </button>
        )}

        <div className="relative h-6 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={mode}
              initial={reduce ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -16, opacity: 0 }}
              transition={{ duration: 0.2, ease: SOFT }}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim"
            >
              {signup ? "Create your account" : "Welcome back"}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {signup && (
            <motion.div
              key="name"
              initial={reduce ? false : { height: 0, opacity: 0, x: 64 }}
              animate={{ height: "auto", opacity: 1, x: 0 }}
              exit={reduce ? undefined : { height: 0, opacity: 0, x: -64 }}
              transition={{
                height: { duration: 0.32, ease: SOFT },
                opacity: { duration: 0.2 },
                x: reduce ? { duration: 0 } : BOUNCE,
              }}
              style={{ overflow: "hidden" }}
            >
              <Field>
                <input
                  type="text"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  placeholder="What should we call you? (optional)"
                  aria-label="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  className={inputClass}
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <Field>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field>
          <input
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={mode === "signin" ? "Password" : "Password (6+ characters)"}
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <AnimatePresence initial={false}>
          {(error || notice) && (
            <motion.div
              key={error ?? notice}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: SOFT }}
              style={{ overflow: "hidden" }}
            >
              {error ? (
                <p role="alert" className="px-1 pb-3 text-[13px] text-hz-3">
                  {error}
                </p>
              ) : (
                <p className="px-1 pb-3 text-[13px] text-sea">{notice}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" size="lg" className="relative w-full overflow-hidden" disabled={busy}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={busy ? "busy" : mode}
              initial={reduce ? false : { y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -18, opacity: 0 }}
              transition={{ duration: 0.18, ease: SOFT }}
              className="flex items-center justify-center"
            >
              {busy ? <Spinner /> : signup ? "Create account" : "Sign in"}
            </motion.span>
          </AnimatePresence>
        </Button>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setNotice(null);
              onModeChange(signup ? "signin" : "signup");
            }}
            className="relative h-11 overflow-hidden text-left text-[14px] text-bone active:text-ochre"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mode}
                initial={reduce ? false : { y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: -14, opacity: 0 }}
                transition={{ duration: 0.18, ease: SOFT }}
                className="flex h-full items-center"
              >
                {signup ? "I already have an account" : "Create an account"}
              </motion.span>
            </AnimatePresence>
          </button>
          <AnimatePresence initial={false}>
            {!signup && (
              <motion.button
                key="forgot"
                type="button"
                onClick={() => void forgot()}
                initial={reduce ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 18 }}
                transition={{ duration: 0.22, ease: SOFT }}
                className="h-11 text-[14px] text-bone-dim active:text-bone"
              >
                Forgot password?
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </form>
  );
}

export function LoginScreen() {
  const { signIn, error } = useAuth();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>(SHOW_GOOGLE ? "options" : "signin");

  async function go() {
    setBusy(true);
    await signIn();
    setBusy(false);
  }

  return (
    <main className="scroll-y relative flex h-full flex-col justify-between gap-8 px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-[calc(env(safe-area-inset-top)+48px)]">
      <div className="fixed inset-0">
        <LoginScene nudge={mode} />
      </div>
      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ochre">
          Outback Safe
        </p>
        <h1 className="mt-4 font-display text-[44px] font-semibold leading-[1.02] tracking-tight text-bone">
          Know the road before you go.
        </h1>
        <p className="mt-4 max-w-[30ch] text-[16px] leading-relaxed text-bone-dim">
          Plan an Australian road trip and see which hazards wait on your route,
          month by month. Sign in to save your routes.
        </p>
      </div>

      <div className="relative space-y-3">
        {mode === "options" ? (
          <>
            <button
              onClick={go}
              disabled={busy}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-bone/10 bg-bone/[0.07] text-[16px] font-medium text-bone backdrop-blur-md transition-colors duration-200 active:bg-bone/[0.12] disabled:opacity-50"
            >
              <GoogleMark />
              Continue with Google
            </button>
            <button
              onClick={() => setMode("signin")}
              className="flex h-14 w-full items-center justify-center rounded-full text-[16px] font-medium text-bone-dim transition-colors duration-200 active:text-bone"
            >
              Continue with email
            </button>
            {error && (
              <p role="alert" className="px-2 text-center text-[13px] text-hz-3">
                {error}
              </p>
            )}
          </>
        ) : (
          <EmailForm mode={mode} onModeChange={setMode} />
        )}
        <p className="px-4 pt-1 text-center text-[12px] leading-relaxed text-bone-faint">
          Hazard information is a guide only, not official safety advice.
        </p>
      </div>
    </main>
  );
}

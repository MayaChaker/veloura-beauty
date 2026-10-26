"use client";

import { useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "@mui/icons-material";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { signIn, signUp } from "../../lib/authClient";
import GoogleIcon from "./GoogleIcon";
import styles from "./auth.module.css";

type Mode = "sign-in" | "sign-up";

/**
 * Only paths on this site, so a crafted ?next= cannot send the shopper elsewhere. The path is
 * resolved the way the browser would: "//evil.com" and "/\evil.com" both leave the site.
 */
export function safeNext(next: string | null) {
  if (!next?.startsWith("/")) return "/account";
  const base = "https://veloura.invalid";
  try {
    const url = new URL(next, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : "/account";
  } catch {
    return "/account";
  }
}

const COPY: Record<Mode, { title: string; intro: string; submit: string; busy: string }> = {
  "sign-in": {
    title: "Sign in",
    intro: "Welcome back. Sign in to see your orders and wishlist.",
    submit: "Sign in",
    busy: "Signing in…",
  },
  "sign-up": {
    title: "Create an account",
    intro: "It takes less than a minute.",
    submit: "Create account",
    busy: "Creating account…",
  },
};

const PERKS = [
  ["Every order in one place", "Follow each order from any device."],
  ["Your wishlist and beauty profile", "Saved to your account, not just this browser."],
  ["Faster checkout", "Your name and email filled in for you."],
];

interface AuthFormProps {
  mode: Mode;
  /** False when Google's keys are not configured: the button is then not offered. */
  google: boolean;
}

// The page's query string. The address does not change while the form is open, so there is
// nothing to subscribe to. On the server it is empty: the form is built ahead of time.
const noSubscription = () => () => {};
const readSearch = () => window.location.search;
const noSearch = () => "";

/**
 * Sign in and create an account: the form on the left, and on the right what an account
 * gives, with the way to the other form. After signing in it returns to ?next=.
 *
 * ?next= is read with useSyncExternalStore rather than useSearchParams: the latter would leave
 * the form out of the pre-built HTML, or swap the form for another once the page loads and
 * lose what the shopper had already typed.
 */
export default function AuthForm({ mode, google }: AuthFormProps) {
  const next = safeNext(
    new URLSearchParams(useSyncExternalStore(noSubscription, readSearch, noSearch)).get("next"),
  );
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const copy = COPY[mode];
  const other: Mode = mode === "sign-in" ? "sign-up" : "sign-in";
  const otherHref = `/${other}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`;

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  const withGoogle = async () => {
    setBusy(true);
    setError("");
    // Leaves for Google's sign-in page, which sends the shopper back to `next`.
    const { error: failure } = await signIn.social({ provider: "google", callbackURL: next });
    if (failure) {
      setError("Google sign-in is not available right now. Please use your email.");
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: failure } =
      mode === "sign-up"
        ? await signUp.email({ name: form.name.trim(), email: form.email, password: form.password })
        : await signIn.email({ email: form.email, password: form.password });
    if (failure) {
      // One message for a wrong email or password: never reveal which accounts exist.
      setError(
        failure.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : mode === "sign-in"
            ? "The email or password is incorrect."
            : (failure.message ?? "The account could not be created."),
      );
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <section className={styles.panel} aria-labelledby="auth-title">
          <p className="text-label text-muted">Your account</p>
          <h1 id="auth-title" className={styles.title}>
            {copy.title}
          </h1>
          <p className={styles.intro}>{copy.intro}</p>

          {google && (
            <>
              <button type="button" className={styles.google} onClick={withGoogle} disabled={busy}>
                <GoogleIcon /> Continue with Google
              </button>
              <p className={styles.or}>or with your email</p>
            </>
          )}

          <form className={styles.form} onSubmit={submit}>
            {mode === "sign-up" && (
              <Input
                label="Name"
                autoComplete="name"
                placeholder="First and last name"
                required
                maxLength={60}
                {...field("name")}
              />
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              maxLength={120}
              {...field("email")}
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="Your password"
              required
              minLength={8}
              maxLength={128}
              hint={mode === "sign-up" ? "Use at least 8 characters." : undefined}
              trailing={
                <button
                  type="button"
                  className={styles.show}
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
              {...field("password")}
            />
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <Button type="submit" fullWidth disabled={busy}>
              {busy ? copy.busy : copy.submit}
            </Button>
          </form>
          <p className={styles.fine}>
            By continuing you agree to our <Link href="/care/terms">Terms</Link> and{" "}
            <Link href="/care/privacy">Privacy</Link> policy.
          </p>
        </section>

        <section className={`${styles.panel} ${styles.aside}`} aria-labelledby="auth-aside">
          <p className="text-label text-muted">
            {mode === "sign-in" ? "New to Veloura?" : "With an account"}
          </p>
          <h2 id="auth-aside" className={styles.title}>
            {mode === "sign-in" ? "Create an account" : "Everything in one place"}
          </h2>
          <ul className={styles.perks}>
            {PERKS.map(([title, copy]) => (
              <li key={title}>
                <Check aria-hidden="true" />
                <p>
                  <strong>{title}</strong>
                  {copy}
                </p>
              </li>
            ))}
          </ul>
          {mode === "sign-in" ? (
            <>
              <Button href={otherHref} variant="secondary" fullWidth>
                Create an account
              </Button>
              <p className={styles.fine}>You can also check out as a guest.</p>
            </>
          ) : (
            <p className={`${styles.fine} ${styles.switch}`}>
              Already a customer? <Link href={otherHref}>Sign in</Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

// Vercel gives each deployment its own URL; sign-in must work on previews as well as the site.
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`);

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
    : null;

/** "Continue with Google" is offered only when its keys are configured. */
export const googleSignInEnabled = google !== null;

/**
 * Accounts with email and password, or Google (Better Auth). Passwords are hashed (scrypt) before they
 * reach the database; a signed-in browser holds only a random session token, in an httpOnly,
 * SameSite cookie that page scripts cannot read. Sign-in attempts are rate limited.
 */
export const auth = betterAuth({
  // BETTER_AUTH_SECRET signs the cookies; BETTER_AUTH_URL is the site's own address.
  baseURL: process.env.BETTER_AUTH_URL || vercelOrigins[0] || "http://localhost:3000",
  trustedOrigins: [process.env.NEXT_PUBLIC_SITE_URL ?? "", ...vercelOrigins].filter(Boolean),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  // Google proves the shopper owns the address, so a Google sign-in joins an existing account
  // with the same email instead of failing or creating a second one.
  socialProviders: google ? { google } : {},
  account: { accountLinking: { enabled: true, trustedProviders: ["google"] } },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // extended at most once a day while in use
  },
  // Counted in the database (the RateLimit table), not in memory: Vercel runs several copies of
  // the server, and each would otherwise keep its own count. Password guessing is the main
  // target, so signing in and up get far tighter limits than the default.
  rateLimit: {
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60 * 60, max: 5 },
    },
  },
  // Must stay last: lets server actions set the session cookie.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

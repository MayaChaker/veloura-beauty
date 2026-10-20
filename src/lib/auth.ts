import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

// Vercel gives each deployment its own URL; sign-in must work on previews as well as the site.
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`);

/**
 * Accounts with email and password (Better Auth). Passwords are hashed (scrypt) before they
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
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // extended at most once a day while in use
  },
  // Must stay last: lets server actions set the session cookie.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

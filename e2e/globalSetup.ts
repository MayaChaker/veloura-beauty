import { execSync } from "node:child_process";

/**
 * Runs once before the browser tests. They sign up accounts and place orders, so they only run
 * against a throwaway database, like the integration tests. Old rate-limit counts are cleared
 * so that sign-ups from an earlier local run do not hit the hourly limit.
 */
export default function globalSetup() {
  const url = process.env.DATABASE_URL ?? "";
  const database = url.split("?")[0]?.split("/").pop() ?? "";
  if (!url) throw new Error("E2E tests need DATABASE_URL (a database whose name ends in _test).");
  if (!process.env.CI && !database.endsWith("_test")) {
    throw new Error(
      `Refusing to run E2E tests on "${database}": they create accounts and orders. ` +
        "Use a database whose name ends in _test.",
    );
  }
  execSync("npx prisma db execute --stdin", {
    input: 'DELETE FROM "RateLimit"; DELETE FROM "RateLimitWindow";',
    stdio: ["pipe", "ignore", "inherit"],
    env: { ...process.env, CHECKPOINT_DISABLE: "1" },
  });
}

import "server-only";
import { db } from "../lib/db";

export interface Limit {
  /** Requests allowed per window. */
  max: number;
  windowSeconds: number;
}

export type LimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * The visitor's IP address, for counting requests. On Vercel, x-forwarded-for is set by the
 * platform itself, so a visitor cannot fake it; anywhere else it could be forged, so every
 * request shares one "local" key instead.
 */
export function clientIp(headers: Headers) {
  const forwarded = process.env.VERCEL ? headers.get("x-forwarded-for") : null;
  return forwarded?.split(",")[0]?.trim() || "local";
}

/**
 * Counts a request against `key` and says whether it is within the limit (a fixed window).
 *
 * The count lives in Postgres, not in memory: Vercel runs several copies of the server at
 * once, and each would otherwise keep its own count. The read, the increment and the window
 * reset are one INSERT … ON CONFLICT statement, so two requests arriving together cannot both
 * read the old count.
 */
export async function hit(key: string, limit: Limit, now = new Date()): Promise<LimitResult> {
  const windowStart = new Date(now.getTime() - limit.windowSeconds * 1000);
  const [row] = await db.$queryRaw<Array<{ count: number; startedAt: Date }>>`
    INSERT INTO "RateLimitWindow" ("key", "startedAt", "count")
    VALUES (${key}, ${now}, 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count"     = CASE WHEN "RateLimitWindow"."startedAt" <= ${windowStart}
                         THEN 1 ELSE "RateLimitWindow"."count" + 1 END,
      "startedAt" = CASE WHEN "RateLimitWindow"."startedAt" <= ${windowStart}
                         THEN ${now} ELSE "RateLimitWindow"."startedAt" END
    RETURNING "count", "startedAt"`;
  if (!row || row.count <= limit.max) return { ok: true };
  const endsAt = row.startedAt.getTime() + limit.windowSeconds * 1000;
  return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((endsAt - now.getTime()) / 1000)) };
}

/** Five orders per visitor every ten minutes: plenty for a shopper, too few for a script. */
export const ORDER_LIMIT: Limit = { max: 5, windowSeconds: 10 * 60 };

/**
 * The rate limiter's single SQL statement against a real Postgres, under concurrent requests.
 * Run with `npm run test:integration` (see src/test/integration).
 */
import assert from "node:assert/strict";
import { after, test } from "node:test";
import "../test/integration/guard";
import { db } from "../lib/db";
import { hit } from "./rateLimit";

const key = `integration|${process.pid}`;
const limit = { max: 5, windowSeconds: 600 };

after(async () => {
  await db.rateLimitWindow.deleteMany({ where: { key } });
  await db.$disconnect();
});

test("ten requests at the same moment against a limit of five: exactly five pass", async () => {
  const results = await Promise.all(Array.from({ length: 10 }, () => hit(key, limit)));
  assert.equal(results.filter((result) => result.ok).length, 5);
  assert.equal((await db.rateLimitWindow.findUniqueOrThrow({ where: { key } })).count, 10);
});

test("once the window has passed, counting starts again", async () => {
  await db.rateLimitWindow.update({
    where: { key },
    data: { startedAt: new Date(Date.now() - 601_000) },
  });
  assert.deepEqual(await hit(key, limit), { ok: true });
  assert.equal((await db.rateLimitWindow.findUniqueOrThrow({ where: { key } })).count, 1);
});

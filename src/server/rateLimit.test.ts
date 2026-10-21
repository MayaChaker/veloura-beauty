/**
 * The limiter with the database replaced: the SQL does the counting (covered by running it
 * against Postgres), so these check what is sent and how the answer is read.
 */
export {}; // a module, so its names do not clash with other test files

const queryRaw = jest.fn();
jest.mock("../lib/db", () => ({ db: { $queryRaw: queryRaw } }));

const { clientIp, hit } = jest.requireActual("./rateLimit.ts") as typeof import("./rateLimit");

const limit = { max: 5, windowSeconds: 600 };
const now = new Date("2026-10-22T12:00:00Z");

beforeEach(() => queryRaw.mockReset());

test("requests up to the limit go through", async () => {
  queryRaw.mockResolvedValueOnce([{ count: 5, startedAt: now }]);
  await expect(hit("orders|1.2.3.4", limit, now)).resolves.toEqual({ ok: true });
  // The key and the times are sent as parameters, never pasted into the SQL.
  expect(queryRaw.mock.calls[0]).toEqual(
    expect.arrayContaining(["orders|1.2.3.4", now, new Date("2026-10-22T11:50:00Z")]),
  );
});

test("the next one is refused until the window ends", async () => {
  // The window opened 4 minutes ago, so it ends in 6.
  queryRaw.mockResolvedValueOnce([{ count: 6, startedAt: new Date("2026-10-22T11:56:00Z") }]);
  await expect(hit("orders|1.2.3.4", limit, now)).resolves.toEqual({
    ok: false,
    retryAfterSeconds: 360,
  });
});

test("the visitor's address is only trusted where the platform sets it", () => {
  const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
  const vercel = process.env.VERCEL;
  try {
    delete process.env.VERCEL;
    expect(clientIp(headers)).toBe("local");
    process.env.VERCEL = "1";
    expect(clientIp(headers)).toBe("203.0.113.7");
    expect(clientIp(new Headers())).toBe("local");
  } finally {
    if (vercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = vercel;
  }
});

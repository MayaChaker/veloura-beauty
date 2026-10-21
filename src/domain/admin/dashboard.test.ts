import {
  dayKeys,
  formatAge,
  formatDay,
  niceMax,
  parseRange,
  storeDay,
  summarize,
} from "./dashboard";

test("a range is one of 7, 30 or 90 days, 30 otherwise", () => {
  expect(parseRange("7")).toBe(7);
  expect(parseRange("90")).toBe(90);
  expect(parseRange("1000")).toBe(30);
  expect(parseRange(undefined)).toBe(30);
});

test("days are counted in Beirut, not in UTC", () => {
  // 22:30 UTC on 21 October is already 01:30 on the 22nd in Beirut (UTC+3).
  expect(storeDay(new Date("2026-10-21T22:30:00Z"))).toBe("2026-10-22");
});

test("day keys cross months and end where asked", () => {
  expect(dayKeys("2026-11-02", 4)).toEqual([
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
    "2026-11-02",
  ]);
  expect(dayKeys("2026-11-02", 2, 2)).toEqual(["2026-10-30", "2026-10-31"]);
});

test("a period sums its own days, fills the gaps and compares with the one before", () => {
  const rows = [
    { day: "2026-10-01", revenueCents: 5000, orders: 1, cancelled: 0 },
    { day: "2026-10-03", revenueCents: 4000, orders: 1, cancelled: 0 },
    { day: "2026-10-04", revenueCents: 8000, orders: 2, cancelled: 1 },
  ];
  const summary = summarize(rows, ["2026-10-03", "2026-10-04"], ["2026-10-01", "2026-10-02"]);
  expect(summary).toMatchObject({
    revenueCents: 12000,
    orders: 3,
    cancelled: 1,
    averageCents: 4000,
    change: 140,
  });
  expect(summarize(rows, ["2026-10-05"], ["2026-10-02"])).toMatchObject({
    revenueCents: 0,
    averageCents: 0,
    change: null,
    series: [{ day: "2026-10-05", revenueCents: 0, orders: 0, cancelled: 0 }],
  });
});

test("an order's age reads naturally", () => {
  const now = new Date("2026-10-22T12:00:00Z");
  expect(formatAge(new Date("2026-10-22T11:59:00Z"), now)).toBe("1 minute");
  expect(formatAge(new Date("2026-10-22T08:00:00Z"), now)).toBe("4 hours");
  expect(formatAge(new Date("2026-10-20T09:00:00Z"), now)).toBe("2 days");
});

test("the chart's scale ends on a round number", () => {
  expect(niceMax(0)).toBe(100);
  expect(niceMax(210)).toBe(250);
  expect(niceMax(830)).toBe(1000);
  expect(niceMax(81)).toBe(100);
});

test("chart dates are short and the same in every browser", () => {
  expect(formatDay("2026-09-23")).toBe("23 Sep");
  expect(formatDay("2026-10-02")).toBe("2 Oct");
});

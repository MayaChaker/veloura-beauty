/**
 * The admin overview's arithmetic, kept apart from the database so it can be tested: which
 * days a range covers, the totals over them, and how they compare with the period before.
 */

export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];
export const DEFAULT_RANGE: RangeDays = 30;

export const parseRange = (value: unknown): RangeDays =>
  RANGES.find((days) => String(days) === value) ?? DEFAULT_RANGE;

/** A product or shade at or below this many is listed under "Low stock". */
export const LOW_STOCK = 5;

/** The store's own calendar: a day starts at midnight in Beirut, not in UTC. */
export const STORE_TIME_ZONE = "Asia/Beirut";

/** "2026-10-22": the date in the store's time zone. */
export const storeDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TIME_ZONE }).format(date);

/**
 * The `count` days ending `endsDaysAgo` days before `today`, oldest first, as "YYYY-MM-DD".
 * Pure calendar arithmetic on UTC noon, so daylight saving can never skip or repeat a day.
 */
export function dayKeys(today: string, count: number, endsDaysAgo = 0): string[] {
  const [year = 0, month = 1, day = 1] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, index) =>
    new Date(Date.UTC(year, month - 1, day - endsDaysAgo - (count - 1 - index), 12))
      .toISOString()
      .slice(0, 10),
  );
}

/** One day of orders, as the database groups them. */
export interface DayTotals {
  day: string;
  revenueCents: number;
  orders: number;
  cancelled: number;
}

export interface PeriodSummary {
  revenueCents: number;
  /** Orders that were not cancelled. */
  orders: number;
  cancelled: number;
  averageCents: number;
  /** Revenue against the period before, in percent; null when there was nothing to compare. */
  change: number | null;
  /** Every day of the period, including days without orders. */
  series: DayTotals[];
}

const sum = (days: DayTotals[], key: "revenueCents" | "orders" | "cancelled") =>
  days.reduce((total, day) => total + day[key], 0);

/** Totals for the days in `current`, compared with the days in `previous`. */
export function summarize(rows: DayTotals[], current: string[], previous: string[]): PeriodSummary {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const series = current.map(
    (day) => byDay.get(day) ?? { day, revenueCents: 0, orders: 0, cancelled: 0 },
  );
  const before = previous.flatMap((day) => byDay.get(day) ?? []);
  const revenueCents = sum(series, "revenueCents");
  const orders = sum(series, "orders");
  const previousRevenue = sum(before, "revenueCents");
  return {
    revenueCents,
    orders,
    cancelled: sum(series, "cancelled"),
    averageCents: orders ? Math.round(revenueCents / orders) : 0,
    change: previousRevenue
      ? Math.round(((revenueCents - previousRevenue) / previousRevenue) * 100)
      : null,
    series,
  };
}

/** 210560 → "$2,105.60": with thousands separators, for totals. */
export const formatMoney = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-18" → "18 Oct". Written out, since some browsers abbreviate September "Sept". */
export const formatDay = (day: string) => {
  const [, month = 1, date = 1] = day.split("-").map(Number);
  return `${date} ${MONTHS[month - 1]}`;
};

/** "35 minutes", "4 hours", "2 days": how long an order has been waiting. */
export function formatAge(since: Date, now: Date) {
  const minutes = Math.max(0, Math.floor((now.getTime() - since.getTime()) / 60_000));
  const [value, unit] =
    minutes < 60
      ? [minutes, "minute"]
      : minutes < 60 * 24
        ? [Math.floor(minutes / 60), "hour"]
        : [Math.floor(minutes / (60 * 24)), "day"];
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

/** A round top for a chart's scale: 0 → 100, 210 → 250, 830 → 1000. */
export function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= value) ?? 10;
  return step * magnitude;
}

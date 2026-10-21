import { render, screen, within } from "@testing-library/react";
import type { Dashboard } from "../../server/admin/dashboard";
import Overview from "./Overview";

const day = (date: string, revenueCents = 0, orders = 0) => ({
  day: date,
  revenueCents,
  orders,
  cancelled: 0,
});

const data: Dashboard = {
  days: 30,
  summary: {
    revenueCents: 210540,
    orders: 31,
    cancelled: 2,
    averageCents: 6792,
    change: 18,
    series: [day("2026-10-20", 21000, 3), day("2026-10-21"), day("2026-10-22", 8100, 1)],
  },
  bestSellers: [
    {
      productId: 7,
      name: "Cloud Paint",
      brand: "Glossier",
      image: null,
      units: 14,
      revenueCents: 30800,
    },
  ],
  lowStock: [
    {
      key: "nars/custard",
      productId: 11,
      name: "Radiant Creamy Concealer",
      detail: "NARS · Custard",
      image: null,
      stock: 0,
    },
  ],
  toShip: [
    {
      id: "o1",
      reference: "VB-EQBJJS",
      name: "Maya Chaker",
      area: "Hamra",
      itemCount: 1,
      totalCents: 8100,
      age: "2 days",
    },
  ],
  toShipCount: 4,
  oldestWaiting: "2 days",
};

test("the overview shows the period's totals and what needs doing", () => {
  render(<Overview data={data} />);
  const kpis = screen.getByText("Average order").closest("dl") as HTMLElement;
  expect(within(kpis).getByText("$2,105.40")).toBeInTheDocument();
  expect(within(kpis).getByText("+18% on the 30 days before")).toBeInTheDocument();
  expect(within(kpis).getByText("Oldest waiting 2 days")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "VB-EQBJJS" })).toHaveAttribute(
    "href",
    "/admin/orders/o1",
  );
  expect(screen.getByText("Sold out")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "30 days" })).toHaveAttribute("aria-current", "page");
  // The chart's numbers are also in a table for screen readers.
  expect(screen.getByRole("rowheader", { name: "20 Oct" })).toBeInTheDocument();
});

test("a quiet period says so instead of drawing empty panels", () => {
  render(
    <Overview
      data={{
        ...data,
        days: 7,
        summary: { ...data.summary, revenueCents: 0, change: null, series: [day("2026-10-22")] },
        bestSellers: [],
        lowStock: [],
        toShip: [],
        toShipCount: 0,
        oldestWaiting: null,
      }}
    />,
  );
  expect(screen.getAllByText("No sales in the last 7 days.")).toHaveLength(2);
  expect(screen.getByText("Nothing is running low.")).toBeInTheDocument();
  expect(screen.getByText("Every order has been shipped.")).toBeInTheDocument();
  expect(screen.getByText("Nothing to compare with yet")).toBeInTheDocument();
});

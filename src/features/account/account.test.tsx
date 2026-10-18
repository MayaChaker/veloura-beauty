import type { ReactElement } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import AppProviders from "../../providers/AppProviders";
import { POLICIES } from "../../data/policies";
import PolicyPage from "../../views/PolicyPage";
import BeautyProfilePage from "../beauty-profile/BeautyProfilePage";
import OrdersPage from "./OrdersPage";

const withProviders = (ui: ReactElement) => render(<AppProviders>{ui}</AppProviders>);
const stored = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null");

test("customer care lists every topic and opens the first question", () => {
  const refund = POLICIES.refund;
  if (!refund) throw new Error("The refund policy is missing");
  render(<PolicyPage slug="refund" content={refund} />);
  const menu = within(screen.getByRole("navigation", { name: "Customer care" }));
  expect(menu.getAllByRole("link")).toHaveLength(Object.keys(POLICIES).length);
  expect(menu.getByRole("link", { name: "Refund policy" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("heading", { level: 1, name: "Refund policy" })).toBeInTheDocument();
  expect(screen.getByText("Eligibility").closest("details")).toHaveAttribute("open");
  expect(screen.getByText("Timing").closest("details")).not.toHaveAttribute("open");
});

test("the beauty profile keeps one skin type and saves to the browser", () => {
  withProviders(<BeautyProfilePage />);
  fireEvent.click(screen.getByRole("button", { name: "Oily" }));
  expect(screen.getByRole("button", { name: "Oily" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Balanced" })).toHaveAttribute("aria-pressed", "false");

  fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
  expect(screen.getByRole("status")).toHaveTextContent("Saved in this browser.");
  expect(stored("velouraBeauty.beautyProfile.v1")).toMatchObject({ skinType: "Oily" });
});

test("order history is empty until an order is placed in this browser", async () => {
  withProviders(<OrdersPage />);
  expect(await screen.findByText(/haven’t placed an order/)).toBeInTheDocument();
});

test("order history lists saved orders with a link to each", async () => {
  window.localStorage.setItem(
    "velouraBeauty.orders.v1",
    JSON.stringify([
      {
        id: "VB-12345678",
        placedAt: "2026-10-16T10:00:00.000Z",
        status: "Confirmed",
        items: [{ productId: 14, cartId: "14", quantity: 2 }],
        total: 138,
        payment: "Cash on delivery",
      },
    ]),
  );
  withProviders(<OrdersPage />);
  expect(await screen.findByText("VB-12345678")).toBeInTheDocument();
  expect(screen.getByText("16 Oct 2026 · 2 items · Cash on delivery")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View order" })).toHaveAttribute(
    "href",
    "/checkout/confirmation/VB-12345678",
  );
});

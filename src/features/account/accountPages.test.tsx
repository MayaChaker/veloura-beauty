import { render, screen, within } from "@testing-library/react";
import OverviewRoute from "../../app/(store)/account/page";
import OrdersRoute from "../../app/(store)/orders/page";
import type { OrderSummary } from "../../domain/orders/summary";
import { TestProviders } from "../../test/catalogue";
import { testAccount } from "../../test/serverAccount";

const order = (reference: string, status: OrderSummary["status"]): OrderSummary => ({
  id: `id-${reference}`,
  reference,
  placedAt: "2026-10-21T10:00:00.000Z",
  status,
  itemCount: 2,
  totalCents: 8100,
  images: [],
});

const ordersPage = (status?: string) =>
  OrdersRoute({
    params: Promise.resolve({}),
    searchParams: Promise.resolve(status ? { status } : {}),
  } as PageProps<"/orders">);

beforeEach(() => {
  testAccount.user = { id: "u1", name: "Maya Chaker", email: "maya@example.com" };
  testAccount.orders = [];
  testAccount.methods = ["Google"];
});

test("the overview greets the shopper and shows the latest order's progress", async () => {
  testAccount.orders = [order("VB-EQBJJS", "Shipped"), order("VB-2PVG2G", "Delivered")];
  render(<TestProviders>{await OverviewRoute()}</TestProviders>);

  expect(screen.getByRole("heading", { level: 1, name: "Hello, Maya" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "VB-EQBJJS" })).toHaveAttribute(
    "href",
    "/checkout/confirmation/id-VB-EQBJJS",
  );
  const track = screen.getByRole("list", { name: "Order shipped" });
  expect(within(track).getByText("Shipped")).toHaveAttribute("data-done", "true");
  expect(within(track).getByText("Delivered")).toHaveAttribute("data-done", "false");
  expect(screen.getByText("Google")).toBeInTheDocument();
  expect(screen.queryByText("VB-2PVG2G")).not.toBeInTheDocument();
});

test("the overview invites a first order when there is none", async () => {
  render(<TestProviders>{await OverviewRoute()}</TestProviders>);
  expect(screen.getByText(/No orders yet/)).toBeInTheDocument();
});

test("orders can be filtered to those still in progress", async () => {
  testAccount.orders = [order("VB-OPEN01", "Placed"), order("VB-DONE01", "Delivered")];
  render(<TestProviders>{await ordersPage("open")}</TestProviders>);

  expect(screen.getByRole("link", { name: "In progress · 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByText("VB-OPEN01")).toBeInTheDocument();
  expect(screen.queryByText("VB-DONE01")).not.toBeInTheDocument();
});

test("a guest is sent to sign in, and back to the page afterwards", async () => {
  testAccount.user = null;
  await expect(ordersPage()).rejects.toThrow("NEXT_REDIRECT /sign-in?next=%2Forders");
});

test("a customer's account menu has no link to the admin", async () => {
  render(<TestProviders>{await OverviewRoute()}</TestProviders>);
  const menu = screen.getByRole("navigation", { name: "Your account" });
  expect(within(menu).queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
});

test("an admin finds the admin in the account menu", async () => {
  testAccount.user = { id: "u1", name: "Maya Chaker", email: "maya@example.com", isAdmin: true };
  render(<TestProviders>{await OverviewRoute()}</TestProviders>);
  const menu = screen.getByRole("navigation", { name: "Your account" });
  expect(within(menu).getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin");
});

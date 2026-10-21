import type { ReactElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { router } from "../../test/navigation";
import CheckoutPage from "./CheckoutPage";
import { TestProviders } from "../../test/catalogue";
import { useSession } from "../../lib/authClient";

const withProviders = (ui: ReactElement) => render(<TestProviders>{ui}</TestProviders>);
const stored = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null");
const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const seedBag = () =>
  window.localStorage.setItem(
    "velouraBeauty.cart.v2",
    JSON.stringify([{ productId: 14, cartId: "14", quantity: 1 }]),
  );

/** Stands in for POST /api/orders and returns the mock, to read what checkout sent. */
const mockOrderApi = (status: number, body: object) => {
  const fetchMock = jest
    .fn()
    .mockResolvedValue({ ok: status < 400, status, json: async () => body });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};
const fillToPayment = () => {
  type("Email", "maya@example.com");
  type("First name", "Maya");
  type("Last name", "Chaker");
  type("Phone", "+961 3 123 456");
  fireEvent.click(screen.getByRole("button", { name: /continue to delivery/i }));
  type("City / area", "Tripoli, El Mina");
  type("Street", "Port street");
  type("Building", "Building 3");
  fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
};

test("a shopper checks out through the API", async () => {
  seedBag();
  window.localStorage.setItem("velouraBeauty.promoCode.v1", JSON.stringify("VELOURA10"));
  const api = mockOrderApi(201, {
    id: "cm2x8fq0000demo",
    reference: "VB-7K2M9Q",
    placedAt: "2026-10-20T10:00:00.000Z",
    totalCents: 7010,
  });
  withProviders(<CheckoutPage />);

  // $69 foundation - 10% = $62.10, plus $8 delivery. The summary is in the phone bar and the
  // desktop column, so each line appears twice.
  expect(await screen.findAllByText("Promotion (VELOURA10)")).toHaveLength(2);
  expect(screen.getAllByText("$70.10").length).toBeGreaterThan(0);

  fillToPayment();
  expect(screen.getByText("Building 3, Port street, Tripoli, El Mina")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Place order · $70.10" }));

  await waitFor(() => expect(router.replace).toHaveBeenCalled());
  // Only ids, shades and quantities go to the server: never a price or a total.
  const [url, init] = api.mock.calls[0];
  expect(url).toBe("/api/orders");
  const sent = JSON.parse(init.body);
  expect(sent.items).toEqual([{ productId: 14, quantity: 1 }]);
  expect(sent).toMatchObject({ paymentMethod: "cash", promoCode: "VELOURA10" });
  expect(JSON.stringify(sent)).not.toMatch(/price|total/i);

  // Orders live on the server now: nothing about them is kept in the browser.
  expect(router.replace).toHaveBeenCalledWith("/checkout/confirmation/cm2x8fq0000demo");
  expect(window.localStorage.getItem("velouraBeauty.orders.v1")).toBeNull();
  expect(stored("velouraBeauty.cart.v2")).toEqual([]);
});

test("only cash on delivery can be chosen until a payment provider is connected", async () => {
  seedBag();
  withProviders(<CheckoutPage />);
  await screen.findByText("Your information");
  fillToPayment();
  expect(screen.getByLabelText(/cash on delivery/i)).toBeChecked();
  for (const method of [/credit or debit card/i, /apple pay/i, /whish money/i]) {
    expect(screen.getByLabelText(method)).toBeDisabled();
  }
  expect(screen.getAllByText("Coming soon")).toHaveLength(3);
});

test("a refusal from the server is shown and the bag is kept", async () => {
  seedBag();
  mockOrderApi(409, { error: "Double Wear Stay-in-Place Foundation has just sold out." });
  withProviders(<CheckoutPage />);
  await screen.findByText("Your information");
  fillToPayment();
  fireEvent.click(screen.getByRole("button", { name: /^place order/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent("has just sold out.");
  expect(router.replace).not.toHaveBeenCalled();
  expect(stored("velouraBeauty.cart.v2")).toHaveLength(1);
});

test("contact details are validated by the browser before continuing", async () => {
  seedBag();
  withProviders(<CheckoutPage />);
  await screen.findByText("Your information");
  type("Email", "not-an-email");
  type("First name", "Maya");
  type("Last name", "Chaker");
  type("Phone", "+961 3 123 456");
  const form = screen.getByLabelText("Email").closest("form");
  if (!form) throw new Error("The email field should be inside a form");
  // jsdom does not block submission, so assert the validation contract directly.
  expect(form.checkValidity()).toBe(false);
  type("Email", "maya@example.com");
  expect(form.checkValidity()).toBe(true);
  // The courier needs a number to call.
  expect(screen.getByLabelText("Phone", { exact: false })).toBeRequired();
});

test("an empty bag is sent back to the shop only after saved state has loaded", async () => {
  withProviders(<CheckoutPage />);
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/shop"));
});

test("a signed-in shopper's name and email are filled in", async () => {
  (useSession as jest.Mock).mockReturnValue({
    data: { user: { id: "u1", name: "Maya Chaker", email: "maya@example.com" } },
    isPending: false,
  });
  seedBag();
  withProviders(<CheckoutPage />);
  await screen.findByText("Your information");
  expect(screen.getByLabelText("Email")).toHaveValue("maya@example.com");
  expect(screen.getByLabelText("First name")).toHaveValue("Maya");
  expect(screen.getByLabelText("Last name")).toHaveValue("Chaker");
  (useSession as jest.Mock).mockReturnValue({ data: null, isPending: false });
});

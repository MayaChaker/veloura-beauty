import type { ReactElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { router } from "../../test/navigation";
import CheckoutPage from "./CheckoutPage";
import OrderConfirmationPage from "./OrderConfirmationPage";
import { TestProviders } from "../../test/catalogue";

const withProviders = (ui: ReactElement) => render(<TestProviders>{ui}</TestProviders>);
const stored = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null");
const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const seedBag = () =>
  window.localStorage.setItem(
    "velouraBeauty.cart.v2",
    JSON.stringify([{ productId: 14, cartId: "14", quantity: 1 }]),
  );

test("a shopper can check out and the confirmation renders from saved orders", async () => {
  seedBag();
  window.localStorage.setItem("velouraBeauty.promoCode.v1", JSON.stringify("VELOURA10"));
  const { unmount } = withProviders(<CheckoutPage />);

  // $69 foundation - 10% = $62.10, plus $8 delivery. The summary is in the phone bar and the
  // desktop column, so each line appears twice.
  expect(await screen.findAllByText("Promotion (VELOURA10)")).toHaveLength(2);
  expect(screen.getAllByText("$70.10").length).toBeGreaterThan(0);

  type("Email", "maya@example.com");
  type("First name", "Maya");
  type("Last name", "Chaker");
  type("Phone", "+961 3 123 456");
  fireEvent.click(screen.getByRole("button", { name: /continue to delivery/i }));
  type("City / area", "Tripoli, El Mina");
  type("Street", "Port street");
  type("Building", "Building 3");
  fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
  expect(screen.getByText("Building 3, Port street, Tripoli, El Mina")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText(/cash on delivery/i));
  fireEvent.click(screen.getByRole("button", { name: "Pay $70.10" }));

  await waitFor(() => expect(router.replace).toHaveBeenCalled());
  const [order] = stored("velouraBeauty.orders.v1");
  expect(router.replace).toHaveBeenCalledWith(`/checkout/confirmation/${order.id}`);
  expect(router.replace).not.toHaveBeenCalledWith("/shop");
  expect(order).toMatchObject({ total: 70.1, paymentMethod: "cash", payment: "Cash on delivery" });
  expect(order.shipping).toMatchObject({ area: "Tripoli, El Mina", building: "Building 3" });
  expect(stored("velouraBeauty.cart.v2")).toEqual([]);

  unmount();
  withProviders(<OrderConfirmationPage orderId={order.id} />);
  expect(await screen.findByText("Thank you, Maya.")).toBeInTheDocument();
  expect(screen.getByText("Cash on delivery")).toBeInTheDocument();
});

test("card details are never stored with the order", async () => {
  seedBag();
  withProviders(<CheckoutPage />);
  await screen.findByText("Your information");
  type("Email", "maya@example.com");
  type("First name", "Maya");
  type("Last name", "Chaker");
  type("Phone", "+961 3 123 456");
  fireEvent.click(screen.getByRole("button", { name: /continue to delivery/i }));
  type("City / area", "Beirut");
  type("Street", "Rue Gouraud");
  type("Building", "14");
  fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
  type("Card number", "4242 4242 4242 4242");
  // The card fields have no name, so they are never part of the submitted form.
  expect(screen.getByLabelText("Card number")).not.toHaveAttribute("name");
  fireEvent.click(screen.getByRole("button", { name: /^pay/i }));

  await waitFor(() => expect(router.replace).toHaveBeenCalled());
  expect(window.localStorage.getItem("velouraBeauty.orders.v1")).not.toContain("4242");
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

test("an unknown order shows the not-found page", async () => {
  withProviders(<OrderConfirmationPage orderId="VB-missing" />);
  expect(await screen.findByText("We couldn’t find that page.")).toBeInTheDocument();
});

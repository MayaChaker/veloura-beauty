import { render, screen } from "@testing-library/react";
import ConfirmationRoute, {
  generateMetadata,
} from "../../app/checkout/confirmation/[orderId]/page";
import { receipt } from "../../test/receipt";
import OrderConfirmationPage from "./OrderConfirmationPage";

const params = (orderId: string) => ({
  params: Promise.resolve({ orderId }),
  searchParams: Promise.resolve({}),
});

test("shows the saved order with the server's totals", () => {
  render(<OrderConfirmationPage order={receipt} />);
  expect(screen.getByText("Order VB-7K2M9Q")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Thank you, Maya." })).toBeInTheDocument();
  expect(screen.getByText("Custard")).toBeInTheDocument();
  expect(screen.getByText("Promotion (VELOURA10)")).toBeInTheDocument();
  expect(screen.getByText("−$6.80")).toBeInTheDocument();
  expect(screen.getByText("$69.20")).toBeInTheDocument();
  expect(screen.getByText(receipt.address)).toBeInTheDocument();
});

test("the route renders a saved order and 404s an unknown one", async () => {
  render(await ConfirmationRoute(params(receipt.id)));
  expect(screen.getByText("Order VB-7K2M9Q")).toBeInTheDocument();
  await expect(ConfirmationRoute(params("not-an-order"))).rejects.toThrow("NEXT_NOT_FOUND");
});

test("an unknown order's 404 is not titled as a confirmation", async () => {
  await expect(generateMetadata(params(receipt.id))).resolves.toMatchObject({
    title: "Order confirmed",
  });
  await expect(generateMetadata(params("not-an-order"))).resolves.toMatchObject({
    title: "Page not found",
  });
});

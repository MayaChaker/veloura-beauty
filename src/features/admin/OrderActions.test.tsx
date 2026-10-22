import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { updateOrderStatus } from "../../server/admin/orderActions";
import OrderActions from "./OrderActions";

jest.mock("../../server/admin/orderActions", () => ({ updateOrderStatus: jest.fn() }));
const update = jest.mocked(updateOrderStatus);

beforeEach(() => update.mockReset().mockResolvedValue({ ok: true }));

test("a placed order offers the next step and the amount to collect", async () => {
  render(<OrderActions orderId="o1" status="Placed" totalCents={8100} />);
  expect(screen.getByText("$81.00")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Mark as shipped" }));
  await waitFor(() => expect(update).toHaveBeenCalledWith("o1", "Shipped"));
});

test("cancelling asks once more before it happens", async () => {
  render(<OrderActions orderId="o1" status="Shipped" totalCents={8100} />);
  expect(screen.getByRole("button", { name: "Mark as delivered" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cancel order" }));
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Yes, cancel it" }));
  await waitFor(() => expect(update).toHaveBeenCalledWith("o1", "Cancelled"));
});

test("a refusal from the server is shown", async () => {
  update.mockResolvedValueOnce({ ok: false, error: "This order has changed." });
  render(<OrderActions orderId="o1" status="Placed" totalCents={8100} />);
  fireEvent.click(screen.getByRole("button", { name: "Mark as shipped" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("This order has changed.");
});

test("a delivered order has nothing left to do", () => {
  render(<OrderActions orderId="o1" status="Delivered" totalCents={8100} />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.getByText("Delivered and paid.")).toBeInTheDocument();
});

test("a server that cannot be reached is reported instead of breaking the page", async () => {
  update.mockRejectedValueOnce(new Error("Failed to fetch"));
  render(<OrderActions orderId="o1" status="Placed" totalCents={8100} />);
  fireEvent.click(screen.getByRole("button", { name: "Mark as shipped" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be updated");
});

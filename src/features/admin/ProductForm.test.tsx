import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { updateProduct } from "../../server/admin/productActions";
import { router } from "../../test/navigation";
import ProductForm, { type EditableProduct } from "./ProductForm";

jest.mock("../../server/admin/productActions", () => ({ updateProduct: jest.fn() }));
const update = jest.mocked(updateProduct);

const concealer: EditableProduct = {
  id: 11,
  priceCents: 3400,
  wasPriceCents: null,
  stock: null,
  shades: [
    { key: "vanilla", name: "Vanilla", swatch: "#efd6c0", stock: 23 },
    { key: "ginger", name: "Ginger", swatch: "#c99668", stock: 4 },
  ],
  soldLast30Days: 27,
};

const save = () => screen.getByRole("button", { name: "Save changes" });
const priceInput = () => screen.getAllByRole("textbox")[0] as HTMLInputElement;

beforeEach(() => update.mockReset().mockResolvedValue({ ok: true }));

test("nothing can be saved until something changes", () => {
  render(<ProductForm product={concealer} />);
  expect(save()).toBeDisabled();
  expect(screen.getByText("Ginger · 4 left")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Ginger in stock"), { target: { value: "30" } });
  expect(save()).toBeEnabled();
  expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes");
});

test("only changed shades are sent, with the stock the form loaded", async () => {
  render(<ProductForm product={concealer} />);
  fireEvent.change(priceInput(), { target: { value: "30" } });
  fireEvent.change(screen.getByLabelText("Ginger in stock"), { target: { value: "30" } });
  fireEvent.click(save());
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({
      productId: 11,
      priceCents: 3000,
      wasPriceCents: null,
      stock: null,
      shades: [{ key: "ginger", expected: 4, value: 30 }],
    }),
  );
  expect(await screen.findByText("Saved. The store shows it now.")).toBeInTheDocument();
  expect(router.refresh).toHaveBeenCalled();
});

test("a price that is not a price, or a was price below it, blocks saving", () => {
  render(<ProductForm product={concealer} />);
  fireEvent.change(priceInput(), { target: { value: "34,50" } });
  expect(screen.getByText("Enter a price, e.g. 34.00")).toBeInTheDocument();
  expect(save()).toBeDisabled();
  fireEvent.change(priceInput(), { target: { value: "34" } });
  fireEvent.change(screen.getAllByRole("textbox")[1] as HTMLInputElement, {
    target: { value: "20" },
  });
  expect(screen.getByText("The was price must be higher than the price.")).toBeInTheDocument();
  expect(save()).toBeDisabled();
});

test("when an order changed the stock, the admin can reload the numbers", async () => {
  update.mockResolvedValueOnce({
    ok: false,
    error: "Ginger’s stock changed while you were editing.",
  });
  render(<ProductForm product={concealer} />);
  fireEvent.change(screen.getByLabelText("Ginger in stock"), { target: { value: "30" } });
  fireEvent.click(save());
  expect(await screen.findByText(/Ginger’s stock changed/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reload the numbers" }));
  expect(router.refresh).toHaveBeenCalled();
});

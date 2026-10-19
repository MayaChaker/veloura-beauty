import { fireEvent, render, screen, within } from "@testing-library/react";
import BrandsPage from "./BrandsPage";

const allBrands = () => within(screen.getByRole("region", { name: /brands$/i }));

test("lists every brand A to Z, with the featured brands above", async () => {
  render(await BrandsPage());
  expect(screen.getByRole("heading", { name: "Featured houses" })).toBeInTheDocument();
  expect(allBrands().getByRole("link", { name: /Anastasia Beverly Hills/ })).toHaveAttribute(
    "href",
    "/brands/anastasia-beverly-hills",
  );
  expect(allBrands().getByText("31 brands · A–Z")).toBeInTheDocument();
});

test("search ignores case and accents, and hides the featured brands", async () => {
  render(await BrandsPage());
  fireEvent.change(screen.getByPlaceholderText("Find a brand"), { target: { value: "estee" } });
  expect(screen.queryByRole("heading", { name: "Featured houses" })).not.toBeInTheDocument();
  expect(allBrands().getByRole("link", { name: /Estée Lauder/ })).toBeInTheDocument();
  expect(allBrands().getAllByRole("link")).toHaveLength(1);

  fireEvent.change(screen.getByPlaceholderText("Find a brand"), { target: { value: "zzz" } });
  expect(screen.getByText("No brand matches “zzz”.")).toBeInTheDocument();
});

test("a category chip keeps only the brands Veloura carries in it", async () => {
  render(await BrandsPage());
  fireEvent.click(screen.getByRole("button", { name: /^Haircare/ }));
  expect(screen.getByRole("button", { name: /^Haircare/ })).toHaveAttribute("aria-pressed", "true");
  expect(allBrands().getByRole("link", { name: /Olaplex/ })).toBeInTheDocument();
  expect(allBrands().queryByRole("link", { name: /Chanel/ })).not.toBeInTheDocument();
  expect(allBrands().getByText("6 brands · A–Z")).toBeInTheDocument();
});

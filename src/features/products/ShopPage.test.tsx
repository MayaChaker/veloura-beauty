import { fireEvent, render, screen } from "@testing-library/react";
import { router, setLocation } from "../../test/navigation";
import ShopPage from "./ShopPage";
import { catalogue, TestProviders } from "../../test/catalogue";

const renderShop = (props: Parameters<typeof ShopPage>[0]) =>
  render(
    <TestProviders>
      <ShopPage {...props} />
    </TestProviders>,
  );

test("filters are read from the URL so filtered links can be shared", () => {
  setLocation("/shop/makeup?brand=NARS&price=25-50");
  renderShop({ category: "makeup" });
  const expected = catalogue.products.filter(
    (product) =>
      product.category === "Makeup" &&
      product.brand === "NARS" &&
      product.price >= 25 &&
      product.price < 50,
  ).length;
  expect(
    screen.getByText(`${expected} ${expected === 1 ? "product" : "products"}`),
  ).toBeInTheDocument();

  // Removing a filter rewrites the URL in place instead of adding a history entry.
  fireEvent.click(screen.getByRole("button", { name: "Remove $25 – $50" }));
  expect(router.replace).toHaveBeenCalledWith("/shop/makeup?brand=NARS", { scroll: false });
});

test("a brand page shows the brand and only its products", () => {
  setLocation("/brands/chanel");
  renderShop({ brandSlug: "chanel" });
  expect(screen.getByRole("heading", { level: 1, name: "Chanel" })).toBeInTheDocument();
  const count = catalogue.products.filter((product) => product.brand === "Chanel").length;
  expect(screen.getByText(`${count} products`)).toBeInTheDocument();
});

test("search with no results offers a way back", () => {
  setLocation("/search?q=zzzz");
  renderShop({ search: true });
  expect(screen.getByRole("heading", { name: "Nothing found for “zzzz”" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View all products" })).toHaveAttribute("href", "/shop");
});

import { expect, test } from "@playwright/test";
import { SHADED_PRODUCT } from "./helpers";

// With JavaScript off, a page shows only the HTML the server built: what search engines, link
// previews and a shopper on a slow connection see first. Listing and product pages read their
// URL on the client, so their content must not wait for it.
test.use({ javaScriptEnabled: false });

const pages = [
  { path: `/product/${SHADED_PRODUCT.slug}`, heading: SHADED_PRODUCT.name },
  { path: "/shop", heading: "All products" },
  { path: "/shop/makeup", heading: "Makeup" },
  { path: "/brands/nars", heading: "NARS" },
  { path: "/sign-in", heading: "Sign in" },
];

for (const { path, heading } of pages) {
  test(`${path} is in the HTML before any JavaScript`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}

test("a product's price and add button are in the HTML", async ({ page }) => {
  await page.goto(`/product/${SHADED_PRODUCT.slug}`);
  await expect(page.getByRole("button", { name: /^Add to bag/ }).first()).toBeVisible();
  await expect(page.getByText("$34.00").first()).toBeVisible();
});

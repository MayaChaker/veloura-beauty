import { expect, test } from "@playwright/test";
import { SHADED_PRODUCT, addShadeToBag, newEmail, press, signOut, signUp } from "./helpers";

test("signing out leaves nothing for the next account on this browser", async ({ page }) => {
  await signUp(page, "First Shopper", newEmail("first"));

  await addShadeToBag(page);
  await page.keyboard.press("Escape");
  await press(
    page
      .getByRole("button", { name: new RegExp(`${SHADED_PRODUCT.name} (to|from) wishlist$`) })
      .first(),
  );
  await page.goto("/wishlist");
  await expect(page.getByRole("link", { name: SHADED_PRODUCT.name }).first()).toBeVisible();

  await signOut(page);
  await signUp(page, "Second Shopper", newEmail("second"));

  // The second account starts empty: no wishlist, and no bag to check out.
  await page.goto("/wishlist");
  await expect(page.getByText("Save products with the heart to find them here.")).toBeVisible();
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/shop$/, { timeout: 15_000 });
});

test("a customer who opens the admin gets the ordinary 404", async ({ page }) => {
  await signUp(page, "Curious Customer", newEmail("customer"));
  const response = await page.goto("/admin/orders");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "We couldn’t find that page." })).toBeVisible();
  await expect(page).toHaveTitle("Page not found | Veloura Beauty");
});

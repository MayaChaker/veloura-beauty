import { expect, test } from "@playwright/test";
import { SHADED_PRODUCT, addShadeToBag } from "./helpers";

test("a guest buys a shade and reaches the confirmation", async ({ page }) => {
  const bag = await addShadeToBag(page);
  await bag.getByRole("button", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByLabel("Email", { exact: true }).fill("guest@e2e.example.com");
  await page.getByLabel("First name").fill("Guest");
  await page.getByLabel("Last name").fill("Shopper");
  await page.getByLabel("Phone").fill("+961 3 000 000");
  await page.getByRole("button", { name: "Continue to delivery" }).click();

  await page.getByLabel("City / area").fill("Tripoli");
  await page.getByLabel("Street", { exact: true }).fill("Port street");
  await page.getByLabel("Building", { exact: true }).fill("Building 3");
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page.getByLabel(/cash on delivery/i)).toBeChecked();
  await page.getByRole("button", { name: /^Place order/ }).click();

  // The confirmation is read back from the database, on the order's own URL.
  await expect(page).toHaveURL(/\/checkout\/confirmation\/.+/);
  await expect(page.getByRole("heading", { name: "Thank you, Guest." })).toBeVisible();
  await expect(page.getByText(/^Order VB-[2-9A-Z]{6}$/)).toBeVisible();
  await expect(page.getByText(SHADED_PRODUCT.name).first()).toBeVisible();
  await expect(page.getByText(SHADED_PRODUCT.shade).first()).toBeVisible();
});

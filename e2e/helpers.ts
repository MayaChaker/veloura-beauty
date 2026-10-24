import { execSync } from "node:child_process";
import { expect, type Locator, type Page } from "@playwright/test";

export const PASSWORD = "a-long-test-password";

/** A new address for every account, so tests never depend on one another. */
export const newEmail = (who: string) =>
  `${who}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@e2e.example.com`;

/**
 * Clicks a toggle until it reports itself pressed. A click that lands before React has
 * hydrated the page does nothing, so a single click would make the test flaky.
 */
export async function press(toggle: Locator) {
  await expect(async () => {
    if ((await toggle.getAttribute("aria-pressed")) !== "true") await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
  }).toPass();
}

/** Creates an account through the sign-up page and waits until it lands on the account. */
export async function signUp(page: Page, name: string, email: string) {
  await page.goto("/sign-up");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  // Hashing the password is slow on purpose, and the first request warms the server up.
  await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 });
}

export async function signOut(page: Page) {
  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
}

/** Gives an account the admin role with the same command an operator would use. */
export function makeAdmin(email: string) {
  execSync(`npm run make-admin -- ${email}`, { stdio: "ignore" });
}

export const SHADED_PRODUCT = {
  slug: "nars-radiant-creamy-concealer",
  name: "Radiant Creamy Concealer",
  shade: "Custard",
};

/** Opens the shaded product, picks the test shade and adds it to the bag, which opens. */
export async function addShadeToBag(page: Page) {
  await page.goto(`/product/${SHADED_PRODUCT.slug}`);
  await press(page.getByRole("button", { name: `Select ${SHADED_PRODUCT.shade} shade` }));
  await page
    .getByRole("button", { name: /^Add to bag/ })
    .first()
    .click();
  const bag = page.getByRole("dialog", { name: /Your bag/ });
  await expect(bag.getByRole("link", { name: SHADED_PRODUCT.name })).toBeVisible();
  await expect(bag.getByText(new RegExp(`^${SHADED_PRODUCT.shade} ·`))).toBeVisible();
  return bag;
}

import { expect, test } from "@playwright/test";
import { makeAdmin, newEmail, signUp } from "./helpers";

test("an admin finds an order and ships it", async ({ page }) => {
  // An order placed through the API, as the checkout would.
  const placed = await page.request.post("/api/orders", {
    data: {
      items: [{ productId: 1, quantity: 1 }],
      contact: {
        email: "admin-test@e2e.example.com",
        firstName: "Order",
        lastName: "ToShip",
        phone: "+961 3 000 000",
      },
      shipping: {
        area: "Tripoli",
        street: "Port street",
        building: "3",
        floor: "",
        directions: "",
        country: "Lebanon",
      },
      paymentMethod: "cash",
    },
  });
  expect(placed.status()).toBe(201);
  const { reference } = (await placed.json()) as { reference: string };

  const email = newEmail("admin");
  await signUp(page, "Store Admin", email);
  makeAdmin(email);

  // The account menu now links to the admin.
  await page.goto("/account");
  await page
    .getByRole("navigation", { name: "Your account" })
    .getByRole("link", { name: "Admin" })
    .click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 15_000 });

  await page.goto(`/admin/orders?q=${reference}`);
  await page.getByRole("link", { name: reference }).click();
  await expect(page.getByRole("heading", { name: reference })).toBeVisible();

  await page.getByRole("button", { name: "Mark as shipped" }).click();
  await expect(page.getByRole("button", { name: "Mark as delivered" })).toBeVisible();
  await expect(page.getByText("Shipped", { exact: true }).first()).toBeVisible();
});

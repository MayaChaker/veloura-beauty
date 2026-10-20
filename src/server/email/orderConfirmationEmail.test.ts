import { receipt } from "../../test/receipt";
import { orderConfirmationEmail } from "./orderConfirmationEmail";

const SITE = "https://veloura.example";

test("names the order and links back to it", () => {
  const email = orderConfirmationEmail(receipt, SITE);
  expect(email.subject).toBe("Your Veloura order VB-7K2M9Q");
  expect(email.html).toContain(`${SITE}/checkout/confirmation/${receipt.id}`);
  expect(email.text).toContain(`View your order: ${SITE}/checkout/confirmation/${receipt.id}`);
});

test("lists the lines and totals in both the HTML and the text version", () => {
  const email = orderConfirmationEmail(receipt, SITE);
  for (const part of [email.html, email.text]) {
    expect(part).toContain("NARS · Radiant Creamy Concealer · Custard");
    expect(part).toContain("$68.00");
    expect(part).toContain("−$6.80");
    expect(part).toContain("$69.20");
  }
  expect(email.text).toContain("Promotion (VELOURA10): −$6.80");
});

test("escapes what shoppers typed, so it cannot inject HTML", () => {
  const email = orderConfirmationEmail(
    { ...receipt, firstName: '<img src=x onerror="alert(1)">', address: "A & B" },
    SITE,
  );
  expect(email.html).not.toContain("<img");
  expect(email.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  expect(email.html).toContain("A &amp; B");
});

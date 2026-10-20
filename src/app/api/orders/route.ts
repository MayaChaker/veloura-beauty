import { after } from "next/server";
import { auth } from "../../../lib/auth";
import { sendOrderConfirmation } from "../../../server/email/sendOrderConfirmation";
import { orderInputSchema } from "../../../server/orders/orderInput";
import { placeOrder } from "../../../server/orders/placeOrder";
import { OrderError } from "../../../server/orders/priceOrder";

/**
 * POST /api/orders: places an order.
 * 201 { id, reference, placedAt, totalCents }, then the confirmation email is sent ·
 * 400 invalid input · 404 product gone ·
 * 409 out of stock · 500 anything else (details are logged, never sent).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be JSON." }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Some details are missing.";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    // Guests can order too; a signed-in shopper's order is linked to their account.
    const session = await auth.api.getSession({ headers: request.headers });
    const order = await placeOrder(parsed.data, session?.user.id);
    // After the response: the shopper does not wait for the email, and it cannot fail the order.
    after(() => sendOrderConfirmation(order.id));
    return Response.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Placing an order failed", error);
    return Response.json(
      { error: "Your order could not be placed. Please try again." },
      { status: 500 },
    );
  }
}

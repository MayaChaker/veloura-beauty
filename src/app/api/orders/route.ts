import { after } from "next/server";
import { auth } from "../../../lib/auth";
import { logger, newErrorId } from "../../../lib/logger";
import { sendOrderConfirmation } from "../../../server/email/sendOrderConfirmation";
import { orderInputSchema } from "../../../server/orders/orderInput";
import { placeOrder } from "../../../server/orders/placeOrder";
import { OrderError } from "../../../server/orders/priceOrder";
import { ORDER_LIMIT, clientIp, hit } from "../../../server/rateLimit";

/**
 * POST /api/orders: places an order.
 * 201 { id, reference, placedAt, totalCents }, then the confirmation email is sent ·
 * 400 invalid input · 404 product gone ·
 * 409 out of stock · 429 too many orders from this visitor ·
 * 500 anything else, with a reference (the details are logged, never sent).
 */
export async function POST(request: Request) {
  try {
    return await placeFromRequest(request);
  } catch (error) {
    // Anything unexpected, from the rate limit to the transaction: the shopper gets a
    // reference, never the details; the log has both.
    const errorId = newErrorId();
    logger.error("Placing an order failed", { errorId, error });
    return Response.json(
      {
        error: `Your order could not be placed. Please try again. If it keeps happening, contact us with reference ${errorId}.`,
        errorId,
      },
      { status: 500 },
    );
  }
}

async function placeFromRequest(request: Request) {
  // Checked first, before any work: a script sending orders in a loop is stopped here.
  const limit = await hit(`orders|${clientIp(request.headers)}`, ORDER_LIMIT);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many orders in a short time. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

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
    // Expected refusals (sold out, product gone) are answered as they are.
    if (error instanceof OrderError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

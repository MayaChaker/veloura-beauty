import "server-only";
import { Resend } from "resend";
import { logger } from "../../lib/logger";
import { getOrder } from "../orders/getOrder";
import { orderConfirmationEmail } from "./orderConfirmationEmail";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// Resend's shared sender works without a verified domain, but then only delivers to the
// address the Resend account was opened with. A verified domain removes that limit.
const FROM = process.env.EMAIL_FROM || "Veloura <onboarding@resend.dev>";

/**
 * Emails the shopper their order. Runs after the response has been sent, so the shopper never
 * waits for it, and a failure here never fails the order: it is logged instead.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.info("Confirmation email skipped: RESEND_API_KEY is not set", { orderId });
    return;
  }
  try {
    const order = await getOrder(orderId);
    if (!order) return;
    const email = orderConfirmationEmail(order, SITE);
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM,
      to: order.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (error)
      logger.error("Confirmation email failed", { orderId, reference: order.reference, error });
  } catch (error) {
    logger.error("Confirmation email failed", { orderId, error });
  }
}

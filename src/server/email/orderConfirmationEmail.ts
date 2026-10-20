import { formatCents, type OrderReceipt } from "../../domain/orders/receipt";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/** Escapes text placed in the email's HTML: names and addresses come from shoppers. */
const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The order confirmation email, as HTML (inline styles, tables: what email clients support)
 * and plain text (for clients that do not show HTML, and for spam filters).
 */
export function orderConfirmationEmail(order: OrderReceipt, siteUrl: string): EmailContent {
  const link = `${siteUrl}/checkout/confirmation/${order.id}`;
  const lines = order.items.map((item) => ({
    label: [item.brand, item.name, item.shade].filter(Boolean).join(" · "),
    quantity: item.quantity,
    amount: formatCents(item.unitPriceCents * item.quantity),
  }));
  const totals: Array<[string, string]> = [
    ["Subtotal", formatCents(order.subtotalCents)],
    ...(order.discountCents
      ? [
          [
            `Promotion${order.promoCode ? ` (${order.promoCode})` : ""}`,
            `−${formatCents(order.discountCents)}`,
          ] as [string, string],
        ]
      : []),
    ["Delivery", order.shippingCents ? formatCents(order.shippingCents) : "Free"],
    ["Total", formatCents(order.totalCents)],
  ];

  const text = [
    `Thank you, ${order.firstName}.`,
    `Your order ${order.reference} has been received.`,
    "",
    ...lines.map((line) => `${line.label} × ${line.quantity}  ${line.amount}`),
    "",
    ...totals.map(([label, amount]) => `${label}: ${amount}`),
    "",
    `Deliver to: ${order.address}`,
    `Payment: ${order.payment}`,
    "",
    `View your order: ${link}`,
  ].join("\n");

  const cell = 'style="padding:6px 0;font:14px/1.5 Arial,sans-serif;color:#2a231e"';
  const muted = 'style="padding:6px 0;font:14px/1.5 Arial,sans-serif;color:#7d7165"';
  const html = `<!doctype html><html><body style="margin:0;background:#f6f2eb">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2eb"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf9f5;border:1px solid #ddd3c5">
<tr><td style="padding:32px 32px 8px;font:300 24px Georgia,serif;letter-spacing:6px;color:#2a231e">VELOURA</td></tr>
<tr><td style="padding:16px 32px 0;font:300 28px/1.2 Georgia,serif;color:#2a231e">Thank you, ${escape(order.firstName)}.</td></tr>
<tr><td style="padding:6px 32px 0;font:14px/1.5 Arial,sans-serif;color:#7d7165">Your order <strong style="color:#2a231e">${escape(order.reference)}</strong> has been received.</td></tr>
<tr><td style="padding:24px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${lines.map((line) => `<tr><td ${cell}>${escape(line.label)}</td><td ${muted} align="right">× ${line.quantity}</td><td ${cell} align="right" width="80">${line.amount}</td></tr>`).join("\n")}
</table></td></tr>
<tr><td style="padding:12px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ddd3c5">
${totals.map(([label, amount]) => `<tr><td ${label === "Total" ? cell : muted}>${escape(label)}</td><td ${cell} align="right">${amount}</td></tr>`).join("\n")}
</table></td></tr>
<tr><td style="padding:24px 32px 0;font:14px/1.6 Arial,sans-serif;color:#2a231e"><span style="color:#7d7165">Deliver to</span><br>${escape(order.address)}<br><br><span style="color:#7d7165">Payment</span><br>${escape(order.payment)}</td></tr>
<tr><td style="padding:28px 32px 36px"><a href="${link}" style="display:inline-block;padding:14px 24px;background:#2a231e;color:#f6f2eb;font:500 14px Arial,sans-serif;text-decoration:none">View your order</a></td></tr>
</table></td></tr></table></body></html>`;

  return { subject: `Your Veloura order ${order.reference}`, html, text };
}

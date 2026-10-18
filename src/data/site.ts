import type { MenuColumn, MenuLink } from "./navigation";

const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "care@velourabeauty.com";

/** Footer link columns. Socials and payment methods are separate because they are not set yet. */
export const FOOTER_COLUMNS: readonly MenuColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Makeup", href: "/shop/makeup" },
      { label: "Skincare", href: "/shop/skincare" },
      { label: "Fragrance", href: "/shop/fragrance" },
      { label: "Haircare", href: "/shop/hair" },
      { label: "New in", href: "/shop?collection=new" },
      { label: "Bestsellers", href: "/shop?collection=bestsellers" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact us", href: `mailto:${contact}` },
      { label: "FAQ", href: "/care/faq" },
      { label: "Shipping & returns", href: "/care/shipping" },
      { label: "Refund policy", href: "/care/refund" },
      { label: "Track an order", href: "/care/track" },
    ],
  },
  {
    title: "Veloura",
    links: [
      { label: "Brands A–Z", href: "/brands" },
      { label: "Beauty profile", href: "/profile" },
      { label: "Accessibility", href: "/care/accessibility" },
    ],
  },
];

/**
 * Veloura has no social accounts yet. Add real profile URLs here and the footer shows
 * a Socials column; while the list is empty the column is not rendered.
 */
export const SOCIAL_LINKS: readonly MenuLink[] = [];

/** Payment methods accepted at checkout; listed in the footer once a payment provider is connected. */
export const PAYMENT_METHODS: readonly string[] = [];

export const LEGAL_LINKS: readonly MenuLink[] = [
  { label: "Privacy", href: "/care/privacy" },
  { label: "Terms", href: "/care/terms" },
];

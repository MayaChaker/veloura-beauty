import Link from "next/link";
import EditorialImage from "../components/EditorialImage";
import { BRANDS } from "../data/brands";
import { FREE_SHIPPING_THRESHOLD } from "../domain/commerce/commerceConfig";
import styles from "./AboutPage.module.css";

const CRITERIA = [
  [
    "Performance",
    "Products chosen for quality, reliability, and how well they do what they promise.",
  ],
  ["Experience", "Textures, finishes, packaging and details that make beauty a pleasure to use."],
  ["Everyday fit", "Products that can realistically become part of an everyday routine."],
];

export default function AboutPage() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "care@velourabeauty.com";
  const ordering = [
    [
      "Delivery",
      `Delivered within 3–5 business days after dispatch, complimentary on orders over $${FREE_SHIPPING_THRESHOLD}.`,
    ],
    ["Returns", "Unused products in their original packaging can be returned within 30 days."],
    ["Questions", `Write to ${contact} with your order number.`],
  ];

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1>Our story</h1>
        <div className={styles.copy}>
          <p className={styles.lead}>
            Veloura brings makeup, skincare, fragrance and haircare from {BRANDS.length} beauty
            houses into one place, from Chanel and Dior to The Ordinary and Olaplex.
          </p>
          <p>
            We don’t make our own products; we choose them. Beauty shopping can feel endless, so we
            keep the selection small enough to browse, and every product has a reason to be here.
          </p>
        </div>
      </header>

      <figure className={styles.photo}>
        <EditorialImage
          name="shop-the-look"
          alt="A woman applying red lipstick in front of a mirror"
          sizes="(max-width: 1023px) 100vw, 90vw"
          priority
        />
      </figure>

      <section className={styles.block} aria-labelledby="how-we-choose">
        <h2 id="how-we-choose" className="text-h4">
          How we choose
        </h2>
        <dl className={styles.list}>
          {CRITERIA.map(([term, copy]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{copy}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.block} aria-labelledby="ordering">
        <h2 id="ordering" className="text-h4">
          Ordering from Veloura
        </h2>
        <dl className={styles.list}>
          {ordering.map(([term, copy]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{copy}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className={styles.links} aria-label="Continue">
        <Link href="/shop">Shop all products</Link>
        <Link href="/brands">Brands A–Z</Link>
        <Link href="/care/shipping">Customer care</Link>
      </nav>
    </main>
  );
}

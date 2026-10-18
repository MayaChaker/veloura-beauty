import Link from "next/link";
import Button from "../components/ui/Button";
import EditorialImage from "../components/EditorialImage";
import ProductVisual from "../components/product-art/ProductVisual";
import { BRANDS, brandHref } from "../data/brands";
import { FREE_SHIPPING_THRESHOLD } from "../domain/commerce/commerceConfig";
import { productRepository } from "../repositories/productRepository";
import styles from "./AboutPage.module.css";

/** Each way of choosing, pictured by a product that shows it. */
const CRITERIA = [
  {
    title: "Performance",
    copy: "Products chosen for quality, reliability, and how well they do what they promise.",
    slug: "the-ordinary-hyaluronic-acid-2-b5",
  },
  {
    title: "Experience",
    copy: "Textures, finishes, packaging and details that make beauty a pleasure to use.",
    slug: "chanel-no-5-eau-de-parfum",
  },
  {
    title: "Everyday fit",
    copy: "Products that can realistically become part of an everyday routine.",
    slug: "glossier-cloud-paint",
  },
].map((item) => ({
  ...item,
  product: productRepository.getAll().find((product) => product.slug === item.slug),
}));

export default function AboutPage() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "care@velourabeauty.com";
  const ordering = [
    [
      "Delivery",
      `3–5 business days after dispatch, complimentary on orders over $${FREE_SHIPPING_THRESHOLD}.`,
    ],
    ["Returns", "Unused products in their original packaging, within 30 days of delivery."],
    ["Questions", `Write to ${contact} with your order number.`],
  ];

  return (
    <main>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroText}>
          <p className="text-label">Our story</p>
          <h1 id="about-title" className={styles.title}>
            The houses you love, <em>in one place.</em>
          </h1>
          <p className={styles.lead}>
            Veloura brings makeup, skincare, fragrance and haircare from {BRANDS.length} beauty
            houses into one considered edit, from Chanel and Dior to The Ordinary and Olaplex.
          </p>
          <div className={styles.actions}>
            <Button href="/shop">Shop the edit</Button>
            <Button href="/brands" variant="text">
              Brands A–Z
            </Button>
          </div>
        </div>
        <figure className={styles.heroPhoto}>
          <EditorialImage
            name="shop-the-look"
            alt="A woman applying red lipstick in front of a mirror"
            sizes="(max-width: 1023px) 100vw, 58vw"
            priority
          />
        </figure>
      </section>

      <section className={styles.why} aria-labelledby="why-title">
        <h2 id="why-title" className="text-h2">
          Less searching, better finds.
        </h2>
        <div className={styles.prose}>
          <p>
            Beauty shopping can feel endless: too many shelves, too many tabs, and no one to ask. We
            started Veloura to make it simpler.
          </p>
          <p>
            We don’t make our own products; we choose them. We keep the selection small enough to
            browse, and every product on the shelf has a reason to be here.
          </p>
        </div>
      </section>

      <section className={styles.choose} aria-labelledby="choose-title">
        <h2 id="choose-title" className="text-h3">
          How we choose
        </h2>
        <ul className={styles.criteria}>
          {CRITERIA.map((item) => (
            <li key={item.title}>
              <div className={styles.criteriaPhoto}>
                <ProductVisual
                  product={item.product}
                  sizes="(max-width: 699px) 100vw, 30vw"
                  decorative
                />
              </div>
              <h3 className="text-h5">{item.title}</h3>
              <p>{item.copy}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.houses} aria-labelledby="houses-title">
        <div className={styles.housesIntro}>
          <p className="text-label text-muted">The houses</p>
          <h2 id="houses-title" className="text-h3">
            Brands we carry
          </h2>
          <Link href="/brands">All brands A–Z</Link>
        </div>
        <ul className={styles.brandList}>
          {BRANDS.map((brand) => (
            <li key={brand.slug}>
              <Link href={brandHref(brand.name)}>{brand.name}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.ordering} aria-labelledby="ordering-title">
        <h2 id="ordering-title" className="text-h3">
          Ordering from Veloura
        </h2>
        <dl>
          {ordering.map(([term, copy]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{copy}</dd>
            </div>
          ))}
        </dl>
        <Link href="/care/shipping">Customer care</Link>
      </section>
    </main>
  );
}

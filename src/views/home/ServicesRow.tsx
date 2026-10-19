import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD } from "../../domain/commerce/commerceConfig";
import { getCatalogue } from "../../server/catalogue";
import styles from "./ServicesRow.module.css";

const servicesFor = (brandCount: number) => [
  {
    title: "Complimentary delivery",
    copy: `On every order over $${FREE_SHIPPING_THRESHOLD}`,
    href: "/care/shipping",
  },
  {
    title: "Free returns",
    copy: "Within 30 days of delivery",
    href: "/care/shipping",
  },
  {
    title: "Brands A–Z",
    copy: `${brandCount} houses in one place`,
    href: "/brands",
  },
];

/** What shopping at Veloura includes: right under the hero, one line each. */
export default async function ServicesRow() {
  const { brands } = await getCatalogue();
  return (
    <ul className={styles.services}>
      {servicesFor(brands.length).map((service) => (
        <li key={service.title}>
          <Link href={service.href}>
            <span>
              <strong>{service.title}</strong>
              <span>{service.copy}</span>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCatalogue } from "../../hooks/useCatalogue";
import { useCommerce } from "../../hooks/useCommerce";
import { useCustomer } from "../../hooks/useCustomer";
import styles from "./overview.module.css";
import shell from "./accountShell.module.css";

/** The first four saved products, with a link to the full wishlist. */
export function WishlistPreview() {
  const { wishlist, hydrated } = useCommerce();
  const products = useCatalogue()
    .products.filter((product) => wishlist.includes(product.id))
    .slice(0, 4);
  return (
    <section className={`${shell.box} ${shell.wide}`} aria-labelledby="overview-wishlist">
      <div className={shell.boxHead}>
        <h2 id="overview-wishlist">Wishlist</h2>
        {wishlist.length > 0 && <Link href="/wishlist">View all · {wishlist.length}</Link>}
      </div>
      {!hydrated ? null : products.length ? (
        <ul className={styles.wish}>
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/product/${product.slug}`}>
                <span className={styles.photo}>
                  {product.image && (
                    <Image src={product.image} alt="" width={400} height={500} sizes="200px" />
                  )}
                </span>
                <small>{product.brand}</small>
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={shell.empty}>
          Save products with the heart to find them here. <Link href="/shop">Shop all</Link>
        </p>
      )}
    </section>
  );
}

/** The beauty profile's choices as chips. */
export function ProfileSummary() {
  const { profile } = useCustomer();
  const choices = [
    profile.skinType && `${profile.skinType} skin`,
    ...(profile.skinGoals ?? []),
    ...(profile.preferences ?? []),
  ].filter(Boolean);
  return (
    <section className={shell.box} aria-labelledby="overview-profile">
      <div className={shell.boxHead}>
        <h2 id="overview-profile">Beauty profile</h2>
        <Link href="/profile">Edit</Link>
      </div>
      {choices.length ? (
        <ul className={styles.chips}>
          {choices.map((choice) => (
            <li key={choice}>{choice}</li>
          ))}
        </ul>
      ) : (
        <p className={shell.empty}>
          Tell us about your skin and the textures you like.{" "}
          <Link href="/profile">Fill in your profile</Link>
        </p>
      )}
    </section>
  );
}

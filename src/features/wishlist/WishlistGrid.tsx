"use client";

import Button from "../../components/ui/Button";
import ProductGrid, { ProductGridItem } from "../../components/ui/ProductGrid";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCatalogue } from "../../hooks/useCatalogue";
import { useCommerce } from "../../hooks/useCommerce";
import styles from "../account/account.module.css";
import ProductCard from "../products/ProductCard";

/** The saved products as a grid, or how to save some. */
export default function WishlistGrid() {
  const { openCart } = useCartDrawer();
  const { wishlist } = useCommerce();
  const products = useCatalogue().products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      {products.length ? (
        <ProductGrid maxColumns={3}>
          {products.map((p) => (
            <ProductGridItem key={p.id}>
              <ProductCard product={p} onAdded={openCart} />
            </ProductGridItem>
          ))}
        </ProductGrid>
      ) : (
        <div className={styles.empty}>
          <p>Save products with the heart to find them here.</p>
          <Button href="/shop">Shop all products</Button>
        </div>
      )}
    </>
  );
}

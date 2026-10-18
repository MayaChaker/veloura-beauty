"use client";

import Button from "../../components/ui/Button";
import ProductGrid, { ProductGridItem } from "../../components/ui/ProductGrid";
import { productRepository } from "../../repositories/productRepository";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCommerce } from "../../hooks/useCommerce";
import AccountLayout from "../account/AccountLayout";
import styles from "../account/account.module.css";
import ProductCard from "../products/ProductCard";

export default function WishlistPage() {
  const { openCart } = useCartDrawer();
  const { wishlist } = useCommerce();
  const products = productRepository.getAll().filter((p) => wishlist.includes(p.id));
  return (
    <AccountLayout title="Wishlist" current="/wishlist">
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
    </AccountLayout>
  );
}

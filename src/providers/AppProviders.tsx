"use client";

import { useMemo, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import CartDrawer from "../features/cart/CartDrawer";
import { CartDrawerContext, type CartDrawerControls } from "../hooks/useCartDrawer";
import { CatalogueProvider } from "../hooks/useCatalogue";
import { CommerceProvider } from "../hooks/useCommerce";
import { CustomerProvider } from "../hooks/useCustomer";
import type { Product } from "../types/commerce";

// Client-side state shared by every page: the catalogue the server loaded, then the bag,
// wishlist, orders, profile and the bag drawer.
export default function AppProviders({
  products,
  children,
}: {
  products: readonly Product[];
  children: ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const drawer = useMemo<CartDrawerControls>(
    () => ({ openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false) }),
    [],
  );

  return (
    <CatalogueProvider products={products}>
      <MotionConfig reducedMotion="user">
        <CommerceProvider>
          <CustomerProvider>
            <CartDrawerContext.Provider value={drawer}>
              {children}
              <CartDrawer open={cartOpen} close={drawer.closeCart} />
            </CartDrawerContext.Provider>
          </CustomerProvider>
        </CommerceProvider>
      </MotionConfig>
    </CatalogueProvider>
  );
}

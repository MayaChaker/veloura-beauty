import { createContext, useContext, useMemo, type ReactNode } from "react";
import { resolveCart } from "../domain/cart/cart";
import {
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
  type CartEntry,
} from "../domain/cart/cartState";
import { calculateTotals, findPromotion, normalizePromoCode } from "../domain/cart/pricing";
import type { SelectionInput } from "../domain/product/productSelection";
import { toggleWishlistItem } from "../domain/wishlist/wishlist";
import { STORAGE_KEYS } from "../repositories/storageRepository";
import type { CartLine, ProductId, Totals } from "../types/commerce";
import { useCatalogue } from "./useCatalogue";
import { usePersistentState } from "./usePersistentState";

export interface CommerceActions {
  /** Adds one, or `quantity`, of a product or shade. */
  addToCart: (selection: SelectionInput, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  /** Returns true when the code is recognised and applied. */
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  toggleWishlist: (id: ProductId) => void;
}

export interface CommerceState extends CommerceActions {
  cart: CartLine[];
  /** False until the saved bag has been read from storage. */
  hydrated: boolean;
  promoCode: string;
  totals: Totals;
  wishlist: ProductId[];
}

const CommerceContext = createContext<CommerceState | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const catalogue = useCatalogue();
  const [cart, setCart, hydrated] = usePersistentState<CartEntry[]>(STORAGE_KEYS.cart, []);
  const [promoCode, setPromoCode] = usePersistentState(STORAGE_KEYS.promo, "");
  const [wishlist, setWishlist] = usePersistentState<ProductId[]>(STORAGE_KEYS.wishlist, []);

  // Actions only depend on state setters and the catalogue, which the server sends once per
  // page, so their identity is stable and components can list them as effect dependencies.
  const actions = useMemo<CommerceActions>(
    () => ({
      addToCart: (selection, quantity) =>
        setCart((items) => addCartItem(catalogue, items, selection, quantity)),
      updateQuantity: (id, delta) =>
        setCart((items) => updateCartItemQuantity(catalogue, items, id, delta)),
      removeFromCart: (id) => setCart((items) => removeCartItem(items, id)),
      clearCart: () => {
        setCart([]);
        setPromoCode("");
      },
      applyPromoCode: (code) => {
        const valid = Boolean(findPromotion(code));
        setPromoCode(valid ? normalizePromoCode(code) : "");
        return valid;
      },
      removePromoCode: () => setPromoCode(""),
      toggleWishlist: (id) => setWishlist((items) => toggleWishlistItem(items, id)),
    }),
    [catalogue, setCart, setPromoCode, setWishlist],
  );

  const canonicalCart = useMemo(() => resolveCart(catalogue, cart), [catalogue, cart]);
  const totals = useMemo(
    () => calculateTotals(canonicalCart, promoCode),
    [canonicalCart, promoCode],
  );
  const value = useMemo<CommerceState>(
    () => ({ cart: canonicalCart, hydrated, promoCode, totals, wishlist, ...actions }),
    [actions, canonicalCart, hydrated, promoCode, totals, wishlist],
  );
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export const useCommerce = (): CommerceState => {
  const value = useContext(CommerceContext);
  if (!value) throw new Error("useCommerce must be used inside CommerceProvider");
  return value;
};

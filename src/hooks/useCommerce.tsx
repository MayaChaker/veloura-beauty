import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
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
import { useSession } from "../lib/authClient";
import { STORAGE_KEYS, storageRepository } from "../repositories/storageRepository";
import { setWishlistItem, syncWishlist } from "../server/accountActions";
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
  /**
   * Empties the bag and the wishlist kept in this browser, on sign-out: the wishlist is saved
   * in the account, and the next person on this device must not see or inherit either.
   */
  forgetShopper: () => void;
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
  const [wishlist, setWishlist, wishlistLoaded] = usePersistentState<ProductId[]>(
    STORAGE_KEYS.wishlist,
    [],
  );
  const userId = useSession().data?.user.id ?? null;

  // Latest values for the actions below, which stay stable across renders.
  const latest = useRef({ wishlist, userId });
  useEffect(() => {
    latest.current = { wishlist, userId };
  });
  // Bumped on sign-out. An account's wishlist still on its way from the server when the
  // shopper signs out must not be written back into the browser (see forgetShopper).
  const signOuts = useRef(0);

  // Signing in adds what was saved as a guest to the account's wishlist, then shows the
  // account's, so the hearts match on every device. A guest's wishlist stays in this browser.
  useEffect(() => {
    if (!userId || !wishlistLoaded) return;
    let current = true;
    const started = signOuts.current;
    syncWishlist(latest.current.wishlist)
      .then((ids) => {
        if (current && ids && signOuts.current === started) setWishlist(ids);
      })
      .catch(() => {
        // Offline or signed out meanwhile: the browser's wishlist still works.
      });
    return () => {
      current = false;
    };
  }, [userId, wishlistLoaded, setWishlist]);

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
      toggleWishlist: (id) => {
        const saved = !latest.current.wishlist.includes(id);
        setWishlist((items) => toggleWishlistItem(items, id));
        if (latest.current.userId) setWishlistItem(id, saved).catch(() => {});
      },
      forgetShopper: () => {
        signOuts.current += 1;
        // Written straight away, not left to usePersistentState's effect: the next page may load
        // before that effect runs, and would read the previous shopper's things back.
        storageRepository.write(STORAGE_KEYS.cart, []);
        storageRepository.write(STORAGE_KEYS.promo, "");
        storageRepository.write(STORAGE_KEYS.wishlist, []);
        setCart([]);
        setPromoCode("");
        setWishlist([]);
      },
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

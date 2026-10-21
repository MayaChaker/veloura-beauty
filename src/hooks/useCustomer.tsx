import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { EMPTY_PROFILE } from "../domain/customer/beautyProfile";
import { addRecentlyViewedItem } from "../domain/customer/recentlyViewed";
import { useSession } from "../lib/authClient";
import { STORAGE_KEYS } from "../repositories/storageRepository";
import { saveBeautyProfile, syncBeautyProfile } from "../server/accountActions";
import type { ProductId } from "../types/commerce";
import type { BeautyProfile } from "../types/customer";
import { usePersistentState } from "./usePersistentState";

export interface CustomerActions {
  saveProfile: (nextProfile: BeautyProfile) => void;
  addRecentlyViewed: (id: ProductId) => void;
}

export interface CustomerState extends CustomerActions {
  profile: BeautyProfile;
  recentlyViewed: ProductId[];
}

const CustomerContext = createContext<CustomerState | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile, profileLoaded] = usePersistentState(
    STORAGE_KEYS.profile,
    EMPTY_PROFILE,
  );
  const userId = useSession().data?.user.id ?? null;
  const latest = useRef({ profile, userId });
  useEffect(() => {
    latest.current = { profile, userId };
  });

  // Signed in, the account's profile is the one shown; an account without one takes the
  // profile this browser holds.
  useEffect(() => {
    if (!userId || !profileLoaded) return;
    let current = true;
    syncBeautyProfile(latest.current.profile)
      .then((stored) => {
        if (current && stored) setProfile(stored);
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [userId, profileLoaded, setProfile]);
  const [recentlyViewed, setRecentlyViewed] = usePersistentState<ProductId[]>(
    STORAGE_KEYS.recent,
    [],
  );

  // Stable actions: safe to use as effect dependencies (see ProductPage).
  const actions = useMemo<CustomerActions>(
    () => ({
      saveProfile: (nextProfile) => {
        setProfile(nextProfile);
        if (latest.current.userId) saveBeautyProfile(nextProfile).catch(() => {});
      },
      addRecentlyViewed: (id) => setRecentlyViewed((items) => addRecentlyViewedItem(items, id)),
    }),
    [setProfile, setRecentlyViewed],
  );

  const value = useMemo<CustomerState>(
    () => ({ profile, recentlyViewed, ...actions }),
    [actions, profile, recentlyViewed],
  );
  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export const useCustomer = (): CustomerState => {
  const value = useContext(CustomerContext);
  if (!value) throw new Error("useCustomer must be used inside CustomerProvider");
  return value;
};

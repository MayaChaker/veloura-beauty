const PREFIX = "velouraBeauty";

export const STORAGE_KEYS = Object.freeze({
  cart: "cart.v2",
  promo: "promoCode.v1",
  wishlist: "wishlist.v1",
  profile: "beautyProfile.v1",
  recent: "recentlyViewed.v1",
});

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// Storage can be unavailable (private mode, server rendering, quota), so every
// operation fails soft and reads fall back to the caller's default.
export const storageRepository = {
  read<T>(key: StorageKey, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(`${PREFIX}.${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write<T>(key: StorageKey, value: T): void {
    try {
      window.localStorage.setItem(`${PREFIX}.${key}`, JSON.stringify(value));
    } catch {
      // Ignore: persistence is best-effort.
    }
  },
  remove(key: StorageKey): void {
    try {
      window.localStorage.removeItem(`${PREFIX}.${key}`);
    } catch {
      // Ignore: persistence is best-effort.
    }
  },
};

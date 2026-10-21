// Stand-in for src/server/accountActions.ts in Jest: the server actions as mocks. They answer
// as for a guest (null), so the browser's own wishlist and profile are used.
export const syncWishlist = jest.fn(async () => null);
export const setWishlistItem = jest.fn(async () => undefined);
export const syncBeautyProfile = jest.fn(async () => null);
export const saveBeautyProfile = jest.fn(async () => undefined);

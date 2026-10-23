// Stand-ins for the account's server modules in Jest: a signed-in user with a few orders,
// adjustable per test, so account pages render without cookies or a database.
import type { OrderSummary } from "../domain/orders/summary";
import type { AccountUser } from "../server/session";

export const testAccount: {
  user: (AccountUser & { isAdmin?: boolean }) | null;
  orders: OrderSummary[];
  methods: string[];
} = {
  user: { id: "u1", name: "Maya Chaker", email: "maya@example.com" },
  orders: [],
  methods: ["Google"],
};

export const getCurrentUser = async () => testAccount.user;
export const requireUser = async (path: string) => {
  if (!testAccount.user) throw new Error(`NEXT_REDIRECT /sign-in?next=${encodeURIComponent(path)}`);
  return testAccount.user;
};
export const getUserOrders = async (_userId: string, take?: number) =>
  take ? testAccount.orders.slice(0, take) : testAccount.orders;
export const getSignInMethods = async () => testAccount.methods;

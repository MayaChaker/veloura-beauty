// Stand-in for src/server/orders/getOrder.ts in Jest: one known order, anything else is missing.
import { receipt } from "./receipt";

export const getOrder = async (id: string) => (id === receipt.id ? receipt : null);

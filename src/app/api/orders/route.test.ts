/**
 * @jest-environment node
 *
 * POST /api/orders with its collaborators replaced: what each failure answers, and that an
 * unexpected one gives the shopper a reference while the details go to the log only.
 */
export {}; // a module, so its names do not clash with other test files

const placeOrder = jest.fn();
const hit = jest.fn();
const logError = jest.fn();
jest.mock("../../../server/orders/placeOrder", () => ({ placeOrder }));
jest.mock("../../../server/rateLimit", () => ({
  ORDER_LIMIT: { max: 5, windowSeconds: 600 },
  clientIp: () => "1.2.3.4",
  hit,
}));
jest.mock("../../../lib/auth", () => ({ auth: { api: { getSession: async () => null } } }));
jest.mock("../../../server/email/sendOrderConfirmation", () => ({
  sendOrderConfirmation: jest.fn(),
}));
jest.mock("next/server", () => ({ after: jest.fn() }));
jest.mock("../../../lib/logger", () => ({
  logger: { error: logError, info: jest.fn(), warn: jest.fn() },
  newErrorId: () => "7f3a9c2e",
}));

const { POST } = jest.requireActual("./route.ts") as typeof import("./route");

const order = {
  items: [{ productId: 1, quantity: 1 }],
  contact: {
    email: "maya@example.com",
    firstName: "Maya",
    lastName: "Chaker",
    phone: "+961 3 123 456",
  },
  shipping: {
    area: "Tripoli",
    street: "Port street",
    building: "3",
    floor: "",
    directions: "",
    country: "Lebanon",
  },
  paymentMethod: "cash",
};
const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  jest.clearAllMocks();
  hit.mockResolvedValue({ ok: true });
});

test("too many orders are refused before anything else, with a time to wait", async () => {
  hit.mockResolvedValueOnce({ ok: false, retryAfterSeconds: 360 });
  const response = await post(order);
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBe("360");
  expect(placeOrder).not.toHaveBeenCalled();
});

test("an unexpected failure gives a reference, and only the log gets the details", async () => {
  const failure = new Error("connect ECONNREFUSED 10.0.0.5:5432");
  placeOrder.mockRejectedValueOnce(failure);
  const response = await post(order);
  const body = await response.json();

  expect(response.status).toBe(500);
  expect(body.errorId).toBe("7f3a9c2e");
  expect(body.error).toContain("reference 7f3a9c2e");
  // Nothing about the database reaches the shopper.
  expect(JSON.stringify(body)).not.toContain("ECONNREFUSED");
  expect(logError).toHaveBeenCalledWith("Placing an order failed", {
    errorId: "7f3a9c2e",
    error: failure,
  });
});

test("a database that is down while counting still gets the shopper a reference", async () => {
  hit.mockRejectedValueOnce(new Error("Can't reach database server"));
  const response = await post(order);
  expect(response.status).toBe(500);
  expect((await response.json()).errorId).toBe("7f3a9c2e");
});

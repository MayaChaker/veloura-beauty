import { logger, newErrorId } from "./logger";

const lastLine = (spy: jest.SpyInstance) => JSON.parse(spy.mock.calls.at(-1)?.[0] as string);

test("an error is logged as one JSON line, with the error's message and stack", () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  logger.error("Placing an order failed", {
    errorId: "7f3a9c2e",
    error: new Error("connection refused", { cause: new Error("timeout") }),
  });
  const line = lastLine(spy);
  expect(line).toMatchObject({
    level: "error",
    msg: "Placing an order failed",
    errorId: "7f3a9c2e",
    error: { name: "Error", message: "connection refused", cause: { message: "timeout" } },
  });
  expect(line.error.stack).toContain("connection refused");
  expect(Date.parse(line.time)).not.toBeNaN();
  spy.mockRestore();
});

test("info goes to the standard output", () => {
  const spy = jest.spyOn(console, "info").mockImplementation(() => {});
  logger.info("Email skipped", { orderId: "o1" });
  expect(lastLine(spy)).toEqual({
    level: "info",
    msg: "Email skipped",
    time: expect.any(String),
    orderId: "o1",
  });
  spy.mockRestore();
});

test("error ids are short and different each time", () => {
  const first = newErrorId();
  expect(first).toMatch(/^[0-9a-f]{8}$/);
  expect(newErrorId()).not.toBe(first);
});

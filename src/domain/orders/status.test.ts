import { canCancel, nextStatus, statusesBefore } from "./status";

test("an order moves forward one step at a time", () => {
  expect(nextStatus("Placed")).toBe("Shipped");
  expect(nextStatus("Shipped")).toBe("Delivered");
  expect(nextStatus("Delivered")).toBeNull();
  expect(nextStatus("Cancelled")).toBeNull();
});

test("only an order that has not been delivered can be cancelled", () => {
  expect(canCancel("Placed")).toBe(true);
  expect(canCancel("Shipped")).toBe(true);
  expect(canCancel("Delivered")).toBe(false);
  expect(canCancel("Cancelled")).toBe(false);
});

test("each status can only be reached from the one before it", () => {
  expect(statusesBefore("Shipped")).toEqual(["Placed"]);
  expect(statusesBefore("Delivered")).toEqual(["Shipped"]);
  expect(statusesBefore("Cancelled")).toEqual(["Placed", "Shipped"]);
  expect(statusesBefore("Placed")).toEqual([]);
});

import { centsToInput, parseDollars, parseStock, wasPriceProblem } from "./products";

test("a typed price becomes whole cents, with no floating-point rounding", () => {
  expect(parseDollars("34")).toBe(3400);
  expect(parseDollars("34.5")).toBe(3450);
  expect(parseDollars(" $9.90 ")).toBe(990);
  // 0.1 + 0.2 style errors cannot happen: the digits are read, never multiplied as a float.
  expect(parseDollars("19.99")).toBe(1999);
});

test("anything that is not a price is refused", () => {
  for (const value of ["", "abc", "-5", "3.456", "1e3", "34,50", "123456"]) {
    expect(parseDollars(value)).toBeNull();
  }
});

test("cents are shown with two decimals", () => {
  expect(centsToInput(3450)).toBe("34.50");
  expect(centsToInput(990)).toBe("9.90");
  expect(centsToInput(null)).toBe("");
});

test("stock is a whole number from 0 to 10,000", () => {
  expect(parseStock("0")).toBe(0);
  expect(parseStock(" 24 ")).toBe(24);
  expect(parseStock("10001")).toBeNull();
  expect(parseStock("2.5")).toBeNull();
  expect(parseStock("-1")).toBeNull();
});

test("a was price only makes sense above the price", () => {
  expect(wasPriceProblem(3400, null)).toBeNull();
  expect(wasPriceProblem(3400, 4200)).toBeNull();
  expect(wasPriceProblem(3400, 3400)).toMatch(/higher/);
  expect(wasPriceProblem(3400, 2000)).toMatch(/higher/);
});

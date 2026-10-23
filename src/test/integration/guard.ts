// Imported first by every integration test. The tests place orders and change stock, so they
// only run against a database that exists for testing: one whose name ends in "_test", or the
// fresh Postgres that CI starts for each run. Never the development or production database.
const url = process.env.DATABASE_URL ?? "";
const database = url.split("?")[0]?.split("/").pop() ?? "";

if (!url) {
  throw new Error("Integration tests need DATABASE_URL (a database whose name ends in _test).");
}
if (!process.env.CI && !database.endsWith("_test")) {
  throw new Error(
    `Refusing to run integration tests on "${database}": they change data. ` +
      "Use a database whose name ends in _test.",
  );
}

export {};

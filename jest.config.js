const nextJest = require("next/jest");

// Uses Next's compiler and env loading so tests see the same transforms as the app.
const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "^server-only$": "<rootDir>/src/test/serverOnly.js",
    "/server/catalogue$": "<rootDir>/src/test/serverCatalogue.ts",
    "/server/orders/getOrder$": "<rootDir>/src/test/serverOrders.ts",
    "/lib/authClient$": "<rootDir>/src/test/authClient.ts",
  },
});

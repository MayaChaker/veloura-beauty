import "@testing-library/jest-dom";
import { resetNavigation } from "./src/test/navigation";

jest.mock("next/navigation", () => require("./src/test/navigation").navigationMock);
jest.mock("leaflet", () => require("./src/test/leaflet").leafletMock);

beforeEach(() => {
  // Route handler tests run in the Node environment, where there is no window.
  if (typeof window !== "undefined") window.localStorage.clear();
  resetNavigation();
});

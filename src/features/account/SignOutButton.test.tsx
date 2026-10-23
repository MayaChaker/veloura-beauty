import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signOut } from "../../lib/authClient";
import { TestProviders } from "../../test/catalogue";
import { router } from "../../test/navigation";
import SignOutButton from "./SignOutButton";

const signOutMock = signOut as jest.Mock;
const stored = (key: string) =>
  JSON.parse(window.localStorage.getItem(`velouraBeauty.${key}`) ?? "null");
const keep = (key: string, value: unknown) =>
  window.localStorage.setItem(`velouraBeauty.${key}`, JSON.stringify(value));

beforeEach(() => {
  keep("cart.v2", [{ id: "1", quantity: 2 }]);
  keep("wishlist.v1", [3, 7]);
  keep("beautyProfile.v1", { skinType: "Oily", skinGoals: [], preferences: [] });
  keep("recentlyViewed.v1", [3]);
});

test("signing out leaves nothing of the shopper in this browser", async () => {
  signOutMock.mockResolvedValueOnce({ data: { success: true }, error: null });
  render(
    <TestProviders>
      <SignOutButton />
    </TestProviders>,
  );
  // Wait for the saved bag and wishlist to load, as they would on a real page.
  await waitFor(() => expect(stored("wishlist.v1")).toEqual([3, 7]));
  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/"));
  await waitFor(() => expect(stored("wishlist.v1")).toEqual([]));
  expect(stored("cart.v2")).toEqual([]);
  expect(stored("beautyProfile.v1")).toMatchObject({ skinType: "" });
  expect(stored("recentlyViewed.v1")).toEqual([]);
});

test("if signing out fails, the shopper's things stay", async () => {
  signOutMock.mockResolvedValueOnce({ data: null, error: { message: "Network error" } });
  render(
    <TestProviders>
      <SignOutButton />
    </TestProviders>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  await waitFor(() => expect(signOutMock).toHaveBeenCalled());
  expect(router.push).not.toHaveBeenCalled();
  expect(stored("wishlist.v1")).toEqual([3, 7]);
});

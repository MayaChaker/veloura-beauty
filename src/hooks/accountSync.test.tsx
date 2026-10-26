import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSession } from "../lib/authClient";
import {
  saveBeautyProfile,
  setWishlistItem,
  syncBeautyProfile,
  syncWishlist,
} from "../server/accountActions";
import { TestProviders } from "../test/catalogue";
import { useCommerce } from "./useCommerce";
import { useCustomer } from "./useCustomer";

const signedIn = () =>
  (useSession as jest.Mock).mockReturnValue({
    data: { user: { id: "u1", name: "Maya", email: "maya@example.com" } },
    isPending: false,
  });

function Probe() {
  const { wishlist, toggleWishlist } = useCommerce();
  const { profile, saveProfile } = useCustomer();
  return (
    <>
      <p>wishlist: {wishlist.join(",")}</p>
      <p>skin: {profile.skinType || "none"}</p>
      <button onClick={() => toggleWishlist(14)}>toggle 14</button>
      <button onClick={() => saveProfile({ ...profile, skinType: "Dry" })}>dry</button>
    </>
  );
}

afterEach(() => {
  (useSession as jest.Mock).mockReturnValue({ data: null, isPending: false });
  jest.clearAllMocks();
});

test("a guest's wishlist and profile stay in the browser", async () => {
  render(
    <TestProviders>
      <Probe />
    </TestProviders>,
  );
  fireEvent.click(screen.getByRole("button", { name: "toggle 14" }));
  expect(await screen.findByText("wishlist: 14")).toBeInTheDocument();
  expect(syncWishlist).not.toHaveBeenCalled();
  expect(setWishlistItem).not.toHaveBeenCalled();
});

test("signing in merges the guest's wishlist into the account's and shows the account's", async () => {
  window.localStorage.setItem("velouraBeauty.wishlist.v1", JSON.stringify([3]));
  (syncWishlist as jest.Mock).mockResolvedValueOnce([10, 3]);
  (syncBeautyProfile as jest.Mock).mockResolvedValueOnce({
    skinType: "Oily",
    skinGoals: [],
    preferences: [],
  });
  signedIn();
  render(
    <TestProviders>
      <Probe />
    </TestProviders>,
  );

  expect(await screen.findByText("wishlist: 10,3")).toBeInTheDocument();
  expect(syncWishlist).toHaveBeenCalledWith([3]);
  expect(await screen.findByText("skin: Oily")).toBeInTheDocument();
});

test("signed in, each change is saved to the account", async () => {
  signedIn();
  render(
    <TestProviders>
      <Probe />
    </TestProviders>,
  );
  await waitFor(() => expect(syncWishlist).toHaveBeenCalled());

  await act(async () => fireEvent.click(screen.getByRole("button", { name: "toggle 14" })));
  expect(setWishlistItem).toHaveBeenCalledWith(14, true);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "toggle 14" })));
  expect(setWishlistItem).toHaveBeenLastCalledWith(14, false);

  await act(async () => fireEvent.click(screen.getByRole("button", { name: "dry" })));
  expect(saveBeautyProfile).toHaveBeenCalledWith({
    skinType: "Dry",
    skinGoals: [],
    preferences: [],
  });
});

test("an account's wishlist arriving after sign-out is not written back", async () => {
  signedIn();
  let answer: (ids: number[]) => void = () => {};
  (syncWishlist as jest.Mock).mockImplementationOnce(
    () => new Promise<number[]>((resolve) => (answer = resolve)),
  );
  function SignOutProbe() {
    const { forgetShopper } = useCommerce();
    return <button onClick={forgetShopper}>sign out</button>;
  }
  render(
    <TestProviders>
      <Probe />
      <SignOutProbe />
    </TestProviders>,
  );
  await waitFor(() => expect(syncWishlist).toHaveBeenCalled());

  // The shopper signs out while the account's wishlist is still on its way.
  fireEvent.click(screen.getByRole("button", { name: "sign out" }));
  await act(async () => answer([3, 7]));

  expect(screen.getByText("wishlist:")).toBeInTheDocument();
  expect(window.localStorage.getItem("velouraBeauty.wishlist.v1")).toBe("[]");
});

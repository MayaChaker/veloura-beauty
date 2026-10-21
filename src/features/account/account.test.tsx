import type { ReactElement } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { POLICIES } from "../../data/policies";
import PolicyPage from "../../views/PolicyPage";
import ProfileForm from "../beauty-profile/ProfileForm";
import { TestProviders } from "../../test/catalogue";

const withProviders = (ui: ReactElement) => render(<TestProviders>{ui}</TestProviders>);
const stored = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null");

test("customer care lists every topic and opens the first question", () => {
  const refund = POLICIES.refund;
  if (!refund) throw new Error("The refund policy is missing");
  render(<PolicyPage slug="refund" content={refund} />);
  const menu = within(screen.getByRole("navigation", { name: "Customer care" }));
  expect(menu.getAllByRole("link")).toHaveLength(Object.keys(POLICIES).length);
  expect(menu.getByRole("link", { name: "Refund policy" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("heading", { level: 1, name: "Refund policy" })).toBeInTheDocument();
  expect(screen.getByText("Eligibility").closest("details")).toHaveAttribute("open");
  expect(screen.getByText("Timing").closest("details")).not.toHaveAttribute("open");
});

test("the beauty profile keeps one skin type and saves it", () => {
  withProviders(<ProfileForm />);
  fireEvent.click(screen.getByRole("button", { name: "Oily" }));
  expect(screen.getByRole("button", { name: "Oily" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Balanced" })).toHaveAttribute("aria-pressed", "false");

  fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
  expect(screen.getByRole("status")).toHaveTextContent("Saved.");
  expect(stored("velouraBeauty.beautyProfile.v1")).toMatchObject({ skinType: "Oily" });
});

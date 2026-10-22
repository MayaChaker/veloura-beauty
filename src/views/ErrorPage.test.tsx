import { fireEvent, render, screen } from "@testing-library/react";
import ErrorPage from "./ErrorPage";

test("a failed page offers to try again and gives a reference, never the error", () => {
  const retry = jest.fn();
  render(<ErrorPage digest="2871394512" retry={retry} />);
  expect(screen.getByRole("heading", { name: "This page didn’t load." })).toBeInTheDocument();
  expect(screen.getByText(/mention reference 2871394512/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalled();
  expect(screen.getByRole("link", { name: "Customer care" })).toHaveAttribute(
    "href",
    "/care/shipping",
  );
});

test("the admin's version leads back to the overview", () => {
  render(<ErrorPage retry={jest.fn()} home={{ href: "/admin", label: "Back to the overview" }} />);
  expect(screen.getByRole("link", { name: "Back to the overview" })).toHaveAttribute(
    "href",
    "/admin",
  );
  expect(screen.queryByText(/reference/)).not.toBeInTheDocument();
});

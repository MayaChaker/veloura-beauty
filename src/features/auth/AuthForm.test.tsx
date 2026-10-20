import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signIn, signUp } from "../../lib/authClient";
import { router, setLocation } from "../../test/navigation";
import AuthForm from "./AuthForm";

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label, { exact: false }), { target: { value } });

const signInMock = signIn.email as jest.Mock;
const signUpMock = signUp.email as jest.Mock;

test("signing in sends the shopper to their account", async () => {
  signInMock.mockResolvedValueOnce({ data: {}, error: null });
  render(<AuthForm mode="sign-in" />);
  type("Email", "maya@example.com");
  type("Password", "a-long-password");
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/profile"));
  expect(signInMock).toHaveBeenCalledWith({
    email: "maya@example.com",
    password: "a-long-password",
  });
});

test("a failed sign-in never says whether the email exists", async () => {
  signInMock.mockResolvedValueOnce({ data: null, error: { message: "User not found" } });
  render(<AuthForm mode="sign-in" />);
  type("Email", "nobody@example.com");
  type("Password", "a-long-password");
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("The email or password is incorrect.");
  expect(router.push).not.toHaveBeenCalled();
});

test("creating an account asks for a name and a password of at least 8 characters", async () => {
  signUpMock.mockResolvedValueOnce({ data: {}, error: null });
  setLocation("/sign-up?next=/orders");
  render(<AuthForm mode="sign-up" />);
  expect(screen.getByLabelText("Password", { exact: false })).toHaveAttribute("minlength", "8");
  type("Name", "  Maya Chaker ");
  type("Email", "maya@example.com");
  type("Password", "a-long-password");
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));

  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/orders"));
  expect(signUpMock).toHaveBeenCalledWith({
    name: "Maya Chaker",
    email: "maya@example.com",
    password: "a-long-password",
  });
});

test("only paths on this site are followed after signing in", async () => {
  signInMock.mockResolvedValueOnce({ data: {}, error: null });
  setLocation("/sign-in?next=//evil.example");
  render(<AuthForm mode="sign-in" />);
  type("Email", "maya@example.com");
  type("Password", "a-long-password");
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/profile"));
});

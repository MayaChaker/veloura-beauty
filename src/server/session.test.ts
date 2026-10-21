/**
 * The real requireUser, with Better Auth and Next's headers replaced: Jest maps the module
 * path to a stub for page tests, so this test loads the file directly.
 */
jest.mock("next/headers", () => ({ headers: async () => new Headers() }));
const getSession = jest.fn();
jest.mock("../lib/auth", () => ({ auth: { api: { getSession } } }));

const { requireUser } = jest.requireActual("./session.ts") as typeof import("./session");

test("returns the user from the session", async () => {
  getSession.mockResolvedValueOnce({
    user: { id: "u1", name: "Maya", email: "maya@example.com", image: null },
  });
  await expect(requireUser("/orders")).resolves.toEqual({
    id: "u1",
    name: "Maya",
    email: "maya@example.com",
  });
});

test("sends a guest to sign in, then back to the page", async () => {
  getSession.mockResolvedValueOnce(null);
  await expect(requireUser("/account/details")).rejects.toThrow(
    "NEXT_REDIRECT /sign-in?next=%2Faccount%2Fdetails",
  );
});

/**
 * The real requireUser, with Better Auth and Next's headers replaced: Jest maps the module
 * path to a stub for page tests, so this test loads the file directly.
 */
jest.mock("next/headers", () => ({ headers: async () => new Headers() }));
const getSession = jest.fn();
jest.mock("../lib/auth", () => ({ auth: { api: { getSession } } }));
const findUnique = jest.fn();
jest.mock("../lib/db", () => ({ db: { user: { findUnique } } }));
jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { requireUser, requireAdmin, getAdmin } = jest.requireActual(
  "./session.ts",
) as typeof import("./session");

const maya = { id: "u1", name: "Maya", email: "maya@example.com", image: null };

beforeEach(() => jest.clearAllMocks());

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

test("an admin passes, and the role is read from the database", async () => {
  getSession.mockResolvedValueOnce({ user: maya });
  findUnique.mockResolvedValueOnce({ role: "Admin" });
  await expect(requireAdmin("/admin")).resolves.toMatchObject({ id: "u1" });
  expect(findUnique).toHaveBeenCalledWith({ where: { id: "u1" }, select: { role: true } });
});

test("a signed-in customer gets a 404, so the admin area stays hidden", async () => {
  getSession.mockResolvedValueOnce({ user: maya });
  findUnique.mockResolvedValueOnce({ role: "Customer" });
  await expect(requireAdmin("/admin")).rejects.toThrow("NEXT_NOT_FOUND");
});

test("a guest is sent to sign in before the admin area", async () => {
  getSession.mockResolvedValueOnce(null);
  await expect(requireAdmin("/admin")).rejects.toThrow("NEXT_REDIRECT /sign-in?next=%2Fadmin");
  expect(findUnique).not.toHaveBeenCalled();
});

test("getAdmin is null for anyone who is not an admin", async () => {
  getSession.mockResolvedValueOnce({ user: maya });
  findUnique.mockResolvedValueOnce({ role: "Customer" });
  await expect(getAdmin()).resolves.toBeNull();
  getSession.mockResolvedValueOnce(null);
  await expect(getAdmin()).resolves.toBeNull();
});

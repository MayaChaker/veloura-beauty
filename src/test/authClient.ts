// Stand-in for src/lib/authClient.ts in Jest: signed out, and each action is a mock to assert on.
export const signIn = { email: jest.fn() };
export const signUp = { email: jest.fn() };
export const signOut = jest.fn();
export const useSession = jest.fn(() => ({ data: null, isPending: false }));
export const authClient = { signIn, signUp, signOut, useSession };

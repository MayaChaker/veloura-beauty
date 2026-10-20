import { createAuthClient } from "better-auth/react";

/** Sign up, sign in, sign out and the current session, for client components. */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../../../../lib/auth";

/** Every Better Auth endpoint: /api/auth/sign-up/email, /api/auth/sign-in/email, /api/auth/sign-out… */
export const { GET, POST } = toNextJsHandler(auth);

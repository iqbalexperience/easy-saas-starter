import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  apiKeyClient,
  multiSessionClient,
  oneTapClient,
  usernameClient,
  organizationClient
} from "better-auth/client/plugins";
import { toast } from "sonner";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    adminClient(),
    multiSessionClient(),
    apiKeyClient(),
    organizationClient()
  ],
  fetchOptions: {
    onError(e: any) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export const { signUp, signIn, signOut, useSession } = authClient;

authClient.$store.listen("$sessionSignal", async () => { });

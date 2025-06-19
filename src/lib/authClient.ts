import { anonymousClient, usernameClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from './auth';

export const authClient = createAuthClient({
	plugins: [
		usernameClient(),
		anonymousClient(),
		inferAdditionalFields<typeof auth>()
	],
})
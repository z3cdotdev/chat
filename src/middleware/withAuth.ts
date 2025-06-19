import { auth } from "@/lib/auth";
import { Session, User } from "better-auth";
import { UserWithAnonymous } from "better-auth/plugins";
import { ObjectId } from "mongoose";
import { cache } from "react";

export type WithAuthOptions = {
	forceAuth?: boolean;
	headers: Headers;
};

export type SessionData = {
	session: Session;
	user: {
		usage_enhance?: number
		usage_models?: number
		usage_image_generation?: number
		username?: string;
		interests?: string;
		tone?: string;
		bio?: string;
		is_premium?: boolean;
		pinned_agents?: ObjectId[] | string[];
		downloaded_z3cs?: ObjectId[] | string[];
		liked_z3cs?: ObjectId[] | string[];
	} & UserWithAnonymous & User;
}

const getAuth = cache(async (headers: Headers): Promise<SessionData | null> => {
	const session = await auth.api.getSession({ headers });
	if (!session || !session.session || !session.user) {
		return null;
	}
	return {
		session: session.session,
		user: session.user as SessionData["user"]
	};
});

export async function withAuth<T>(
	handler: (session: SessionData) => Promise<T>,
	options: WithAuthOptions = {
		headers: new Headers()
	}
): Promise<Response> {
	try {
		const session = await getAuth(options.headers);
		if (!session && options.forceAuth) {
			return Response.json({ error: "Unauthorized" }, {
				status: 401,
			});
		}

		if ((!session?.session && !session?.user) && options.forceAuth) {
			return Response.json({ error: "Unauthorized" }, {
				status: 401,
			});
		}

		const result = await handler(session as SessionData);
		if (result instanceof Response) return result;
		return Response.json(result, { status: 200 });
	} catch (error) {
		console.error("Error in withAuth middleware:", error);
		return Response.json({ error: "Internal Server Error" }, {
			status: 500,
		});
	}
}
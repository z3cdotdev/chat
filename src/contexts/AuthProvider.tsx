"use client";

import { authClient } from "@/lib/authClient";
import { SessionData } from "@/middleware/withAuth";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<{
	data: SessionData | null,
	refetch: () => void,
	isPending: boolean,
	error: Error | null
}>({
	data: null,
	refetch: () => { },
	isPending: true,
	error: null
});

export const AuthProvider = ({
	children,
	initialSession = null
}: {
	children: React.ReactNode,
	initialSession?: SessionData | null
}) => {
	const [session, setSession] = useState<SessionData | null>(initialSession);
	const {
		isPending,
		refetch,
		data,
		error
	} = authClient.useSession();

	useEffect(() => {
		try {
			if (isPending) return;
			if (error) {
				setSession(null);
				return;
			}

			if (data) {
				setSession(JSON.parse(JSON.stringify(data)) as SessionData);
			} else {
				setSession(null);
			}
		} catch (error) {
			console.error("Error fetching session:", error);
			setSession(null);
		}
	}, [isPending, data, error]);

	return (
		<AuthContext.Provider
			value={{
				refetch,
				isPending,
				data: session,
				error
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

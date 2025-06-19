"use client";

import HotkeysHelp from '@/layout/HotkeysHelp';
import Sidebar from '@/layout/Sidebar';
import Navbar from '@/layout/Navbar';

import { useParams, usePathname } from 'next/navigation';
import { authClient } from '@/lib/authClient';
import { useEffect, useMemo } from 'react';

import { useFontStore } from '@/stores/use-font';
import { useSession } from "@/hooks/use-session";
import { cn } from '@colidy/ui-utils';

export default function Layout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const params = useParams();
	const { data: session, isPending } = useSession();
	const { codeFont, mainFont } = useFontStore();

	useEffect(() => {
		if (!isPending && !session) {
			authClient.signIn.anonymous();
		}
	}, [isPending, session]);

    const isConversation = useMemo(
		() => pathname === '/chats/' + params?.conversationId,
		[pathname, params?.conversationId]
	);

	if (['/auth', '/settings'].some(p => pathname.startsWith(p))) return (
		<div className={`w-full min-h-screen main-font-${mainFont} code-font-${codeFont}`}>
			{children}
		</div>
	);

	return (
		<div className={`flex min-h-screen main-font-${mainFont} code-font-${codeFont}`}>
			<Sidebar />
			<main
				className={cn("flex-1 flex flex-col w-full", {
					"min-h-screen px-9 pb-9": !isConversation,
					"h-screen": isConversation,
				})}
			>
				<Navbar />
				{isConversation ? (
					<div className="flex-1 overflow-y-auto w-full">
						{children}
					</div>
				) : children}
				<HotkeysHelp />
			</main>
		</div>
	);
};
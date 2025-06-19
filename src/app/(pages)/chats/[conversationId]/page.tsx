"use server";
import { api } from "@/lib/api";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Chat from "@/components/chat-ui/chat";
import { ChatProvider } from "@/contexts/ChatProvder";

export default async function ChatPage({ params }: {
	params: Promise<{ conversationId: string }>;
}) {
	const { conversationId } = await params;
	const response = await api.get(`/conversation/${conversationId}`, {
		headers: await headers() as any
	}).then(res => res.data).catch((er) => null);
	if (!response) return notFound();

	return (
		<ChatProvider
			initialMessages={response.conversation.messages}
			response={response.conversation}
		>
			<Chat conversationId={conversationId} response={response.conversation} />
		</ChatProvider>
	);
};
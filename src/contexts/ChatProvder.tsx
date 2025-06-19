"use client";

import { ChatProviderMessage as Message, ChatProviderChatContext as ChatContextType } from '@/lib/definitions';
import { useChatDataStore } from '@/stores/use-chat-data';
import { createContext, useMemo, useState, useEffect } from 'react';

export const ChatContext = createContext<ChatContextType>({
	messages: [],
	// @ts-ignore
	setMessages: () => { }
});

export const ChatProvider = ({ children, initialMessages, response }: {
	children: React.ReactNode;
	initialMessages?: Message[];
	response?: string;
}) => {
	const setResponse = useChatDataStore((state) => state.setResponse);
	const [messages, setMessages] = useState<Message[]>(() => {
		// SSR uyumlu initial state - always use initialMessages
		return initialMessages || [];
	});
	const [isHydrated, setIsHydrated] = useState(false);

	// Client-side hydration kontrolü
	useEffect(() => {
		setIsHydrated(true);

		// Hydration sonrası initialMessages kontrolü
		if (initialMessages && initialMessages.length > 0) {
			setMessages(initialMessages);
		}
	}, [initialMessages]);

	useEffect(() => {
		setResponse(response);
	}, [messages, response]);

	return (
		<ChatContext.Provider value={{
			messages,
			setMessages
		} as any}>
			{children}
		</ChatContext.Provider>
	);
};
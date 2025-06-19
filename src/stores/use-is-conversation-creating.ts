import { create } from 'zustand';

interface IsConversationCreatingState {
	isCreatingConversation: boolean;
	setIsCreatingConversation: (isCreatingConversation: boolean) => void;
}

export const useIsConversationCreating = create<IsConversationCreatingState>()(
	(set) => ({
		isCreatingConversation: false,
		setIsCreatingConversation: (isCreatingConversation) => set({ isCreatingConversation })
	})
);
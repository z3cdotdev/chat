import { create } from 'zustand';

type ChatData = {
	response: any;
	setResponse: (response: any) => void;
};

export const useChatDataStore = create<ChatData>((set) => ({
	response: null,
	setResponse: (response: any) => set({ response })
}));
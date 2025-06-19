import { create } from 'zustand';

interface PromptState {
	prompt: string;
	setPrompt: (value: string) => void;
}

export const usePromptStore = create<PromptState>()(
	(set) => ({
		prompt: '',
		setPrompt: (value) => set({ prompt: value })
	})
);
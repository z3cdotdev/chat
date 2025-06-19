import { create } from 'zustand';

interface AutoSubmitState {
	autoSubmit: boolean;
	setAutoSubmit: (value: boolean) => void;
}

export const useAutoSubmit = create<AutoSubmitState>()(
	(set) => ({
		autoSubmit: false,
		setAutoSubmit: (value) => set({ autoSubmit: value }),
	})
);
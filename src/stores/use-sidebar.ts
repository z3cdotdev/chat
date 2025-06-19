import { create } from 'zustand';

interface UseSidebarState {
	isOpen: boolean;
	toggleSidebar: () => void;
	setIsOpen: (isOpen: boolean) => void;
}

export const useSidebarStore = create<UseSidebarState>()(
	(set) => ({
		isOpen: false,
		toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
		setIsOpen: (isOpen: boolean) => set({ isOpen }),
	}),
);
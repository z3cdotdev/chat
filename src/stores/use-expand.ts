import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

interface ExpandState {
	expand: boolean | null;
	setExpand: (expand: boolean | null) => void;
}

const createSafeStorage = () => {
	const isStorageAvailable = () => {
		try {
			if (typeof window === 'undefined') return false;
			const test = '__storage_test__';
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	};

	// Fallback storage for SSR or unavailable localStorage
	const fallbackStorage = {
		getItem: () => null,
		setItem: () => { },
		removeItem: () => { },
	};

	return isStorageAvailable()
		? localStorage
		: fallbackStorage;
};

export const useExpandStore = create<ExpandState>()(
	persist(
		(set) => ({
			expand: true,
			setExpand: (expand) => set({ expand: expand }),
		}),
		{
			name: 'expand-sidebar',
			storage: createJSONStorage(() => createSafeStorage()),
			skipHydration: typeof window === 'undefined',
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.warn('Expand sidebar rehydration failed:', error);
				}
			},
		}
	)
);
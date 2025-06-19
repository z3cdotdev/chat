import { Z3cModel } from '@/lib/definitions';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Z3cSelectionState {
	selectedZ3C: Z3cModel | null;
	setSelectedZ3C: (z3c: Z3cModel | null) => void;
}

// Storage availability kontrolü
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

export const useZ3cSelectionStore = create<Z3cSelectionState>()(
	persist(
		(set) => ({
			selectedZ3C: null,
			setSelectedZ3C: (z3c) => set({ selectedZ3C: z3c }),
		}),
		{
			name: 'z3c-selection',
			storage: createJSONStorage(() => createSafeStorage()),
			// Hydration mismatch'i önlemek için
			skipHydration: typeof window === 'undefined',
			// Error handling
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.warn('Z3C selection rehydration failed:', error);
				}
			},
		}
	)
);
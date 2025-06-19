import { AgentModel } from '@/lib/definitions';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AgentSelectionState {
	selectedAgent: AgentModel | null;
	setSelectedAgent: (agent: AgentModel | null) => void;
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

export const useAgentSelectionStore = create<AgentSelectionState>()(
	persist(
		(set) => ({
			selectedAgent: null,
			setSelectedAgent: (agent) => set({ selectedAgent: agent }),
		}),
		{
			name: 'model-selection',
			storage: createJSONStorage(() => createSafeStorage()),
			// Hydration mismatch'i önlemek için
			skipHydration: typeof window === 'undefined',
			// Error handling
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.warn('Agent selection rehydration failed:', error);
				}
			},
		}
	)
);
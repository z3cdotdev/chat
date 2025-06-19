import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AnimationReduceMotionState {
	skipAnimations: boolean;
	toggleSkipAnimations: () => void;
	setSkipAnimations: (value: boolean) => void;
}

export const useReduceMotionStore = create<AnimationReduceMotionState>()(
	persist(
		(set) => ({
			skipAnimations: false,
			setSkipAnimations: (value) => set({ skipAnimations: value }),
			toggleSkipAnimations: () => set((state) => ({ skipAnimations: !state.skipAnimations })),
		}),
		{
			name: 'reduce-motion-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
);
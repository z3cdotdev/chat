"use client";
import { InitZ3Schema } from '@/lib/definitions';
import { useAgentSelectionStore } from '@/stores/use-agent-selection';
import { useAgentActionsStore } from '@/stores/use-agent-actions';
import { createContext, useEffect, useMemo } from 'react';
import { useReduceMotionStore } from '@/stores/use-reduce-motion';
import { MotionGlobalConfig } from 'motion/react';

export const Z3Context = createContext<InitZ3Schema | null>(null);

export const Z3Provider = ({
	z3,
	children,
}: {
	z3: InitZ3Schema;
	children: React.ReactNode;
}) => {
	const selectedAgent = useAgentSelectionStore((state) => state.selectedAgent);
	const changeAgent = useAgentActionsStore(s => s.changeAgent);
	const skipAnimations = useReduceMotionStore(s => s.skipAnimations);

	const defaultAgent = z3.defaultAgent || null;

	// İlk yüklemede varsayılan agent'ı ayarla
	useEffect(() => {
		if (!selectedAgent && defaultAgent) {
			changeAgent(defaultAgent.id, z3);
		}
	}, [selectedAgent, defaultAgent, changeAgent, z3]);

	useEffect(() => {
		MotionGlobalConfig.skipAnimations = skipAnimations;
	}, [skipAnimations]);

	return (
		<Z3Context.Provider value={z3}>
			{children}
		</Z3Context.Provider>
	);
};
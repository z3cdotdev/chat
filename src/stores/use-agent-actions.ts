import { create } from 'zustand';
import { AgentModel, InitZ3Schema } from '@/lib/definitions';
import { useAgentSelectionStore } from './use-agent-selection';
import { reduceAgents } from '@/lib/get-agents';
import { useZ3cSelectionStore } from './use-z3cs-select';

interface AgentActionsState {
	changeAgent: (agentId: string | null, z3: InitZ3Schema) => void;
}

export const useAgentActionsStore = create<AgentActionsState>()((set) => ({
	changeAgent: (agentId, z3) => {
		const { setSelectedAgent } = useAgentSelectionStore.getState();
		const { setSelectedZ3C } = useZ3cSelectionStore.getState();
		const defaultAgent = z3.defaultAgent || null;

		if (agentId === null) {
			if (!defaultAgent) {
				console.warn('No default agent available, setting to DefaultAgent');
				return;
			}
			setSelectedAgent(defaultAgent);
			return;
		}

		const agents = reduceAgents(z3.agents);

		const agent = Object.values(agents)
			.flatMap((agent) => agent.models)
			.find((a) => a.id === agentId);

		if (agent) {
			setSelectedZ3C(null);
			setSelectedAgent(agent as AgentModel);
		} else {
			console.warn(`Agent with id ${agentId} not found`);
		}
	},
})); 
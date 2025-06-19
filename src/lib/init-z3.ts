import { AgentModel, InitZ3Schema } from "@/lib/definitions";
import { api } from "./api";

type A = {
	fallbackModel: AgentModel;
	providersWithModelCount: Record<string, number>;
	agents: AgentModel[];
};
export const initZ3 = async (cks: string): Promise<InitZ3Schema> => {
	const [a, b] = await Promise.all([
		api.get<InitZ3Schema['agents']>('/models', {
			headers: {
				'Cookie': cks,
				'Cache-Control': 'no-cache'
			}
		}).then((res: any) => res.data?.data).catch(() => {
			return {
				agents: [],
				fallbackModel: null
			}
		}),
		api.get<InitZ3Schema['agents']>('/z3cs?search=installed_z3cs', {
			headers: {
				'Cookie': cks,
				'Cache-Control': 'no-cache'
			}
		}).then((res: any) => res.data?.data).catch(() => [])
	])

	return {
		agents: a.agents,
		defaultAgent: a.fallbackModel,
		installedZ3Cs: b
	};
};
import { AgentModel } from "./definitions";

export const reduceAgents = (models: AgentModel[]) => {
	const providers = new Set<string>();
	const flatten = models.flat();
	flatten.flat().map(agent => providers.add(agent.provider));

	// @ts-ignore
	return Array.from(providers).map(provider => {
		return {
			provider,
			models: flatten.filter(agent => agent.provider === provider)
		}
	}) as {
		provider: string;
		models: AgentModel[];
	}[]
}
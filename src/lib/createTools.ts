
import { z } from "zod";
import Exa from 'exa-js';
import { tool, Tool } from "ai";
import { AgentModel } from "./definitions";
export const exa = new Exa(process.env.Z3_EXASEARCH_API_KEY);

export const webSearch = tool({
	description: 'Search the web for up-to-date information',
	parameters: z.object({
		query: z.string().min(1).max(100).describe('The search query'),
	}),
	execute: async ({ query }) => {
		const { results } = await exa.searchAndContents(query, {
			livecrawl: 'always',
			numResults: 10,
		});
		return results.map(result => ({
			title: result.title,
			url: result.url,
			content: result.text.slice(0, 1000), // take just the first 1000 characters
			publishedDate: result.publishedDate,
			favicon: result.favicon,
			image: result.image,
		}));
	},
});

export const getAgentTools = (agent: AgentModel, agentOptions: AgentModel["features"]) => {
	const allTools: Record<string, Tool> = {};

	if (agent.features.search && agentOptions.search) {
		allTools["webSearch"] = webSearch;
	}

	if (Object.keys(allTools).length === 0) {
		return undefined;
	}

	return allTools;
};

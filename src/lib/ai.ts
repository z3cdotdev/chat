import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { AgentModel } from "@/database/models/Models";
import { createAnthropic } from "@ai-sdk/anthropic";
import { ApiKeys } from "@/database/models/ApiKeys";
import { SessionData } from "@/middleware/withAuth";
import { createReplicate } from '@ai-sdk/replicate';
import { createOpenAI } from "@ai-sdk/openai";
import { customProvider, tool } from "ai";

export const ai = async ({ session }: {
	session?: SessionData
}) => {
	const { languageModels, imageModels } = await getModels(session);
	return customProvider({
		languageModels,
		imageModels
	})
};
export const getModels = async (session?: SessionData) => {
	const z3c = createOpenRouter({
		apiKey: process.env.Z3_OPENROUTER_API_KEY || ""
	});

	const userKeysResult = session ? await ApiKeys.find({
		user: session?.user.id
	}) : null;

	const userKeys = userKeysResult ? userKeysResult.reduce((acc: any, key: any) => {
		acc[key.service] = key.apiKey;
		return acc;
	}, {}) : {};

	const getCreateModel = (provider: string) => {
		const p = provider.toLowerCase();
		switch (p) {
			case "replicate":
				return createReplicate({
					apiToken: userKeys.replicate || (process.env.Z3_REPLICATE_API_KEY ?? ''),
				}).image;
			case "openai":
				if (!userKeys.openai) return null;
				return createOpenAI({
					apiKey: userKeys.openai
				}).chat;
			case "anthropic":
				if (!userKeys.anthropic) return null;
				return createAnthropic({
					apiKey: userKeys.anthropic
				});
			default:
				return null;
		}
	}

	const agents = await AgentModel.find({
		available: true
	}).lean();

	const languageModels = agents.reduce((acc: any, model: any) => {
		if (model.features.imageGeneration) return acc; // Skip image generation models for language models
		if (userKeys[model.provider]) {
			const agentProvider = getCreateModel(model.provider);
			// @ts-ignore
			acc[model.id] = agentProvider(model.openRouterId);
		} else {
			acc[model.id] = z3c.chat(model.openRouterId);
		}
		return acc;
	}, {});

	const imageModels = agents.reduce((acc: any, model: any) => {
		if (!model.features.imageGeneration) return acc; // Skip language models for image generation
		const agentProvider = getCreateModel(model.provider);
		if (!agentProvider) return acc;
		acc[model.id] = agentProvider(model.openRouterId);
		return acc;
	}, {});

	return {
		languageModels: Object.assign({
			"title-0": z3c.chat("google/gemma-3n-e4b-it:free"),
			"enhancment-0": z3c.chat("google/gemma-3n-e4b-it:free")
		}, languageModels),
		imageModels,
	};
};

export const getAllModelsArray = async () => {
	const { languageModels, imageModels } = await getModels();
	return Object.keys(languageModels).concat(Object.keys(imageModels));
}
import { AgentModel } from "@/lib/definitions";
import { AgentModel as MonguzAgent } from '@/database/models/Models'
import axios from "axios";
import fs from "fs";
import mongoose from "mongoose";

(async () => {
	await mongoose.connect("mongodb://localhost:27017/z3-chat");

	const parseModel = async (model: any) => {
		if (!model.endpoint) return null;
		const openRouterId = model?.endpoint?.model_variant_permaslug;
		let provider = model?.group || model?.endpoint?.model?.provider_info?.displayName;
		if (provider === "Llama2" || provider === "Llama3" || provider === "Llama4") provider = "Meta";
		if (provider === "GPT") provider = "OpenAI";
		if (provider === "Claude") provider = "Anthropic";
		if (provider === "Gemini") provider = "Google";

		if (!provider) throw new Error(`Provider name not found for model: ${model.permaslug} ${model?.provider_slug}`);

		const inputMods = model?.endpoint?.model?.input_modalities || model?.input_modalities;
		const outputMods = model?.endpoint?.model?.output_modalities || model?.output_modalities;
		const isReasoning = model?.endpoint?.supports_reasoning || model?.reasoning_config !== null;
		const id = model?.endpoint?.id;
		const slug = model?.endpoint?.model?.slug || model?.permaslug;
		const name = model?.endpoint?.model?.short_name || model?.short_name;
		const description = model?.endpoint?.model?.description || model?.description;
		const is_free = model?.endpoint?.is_free || model.name.endsWith("(free)") || slug?.endsWith("free");
		const toolSupported = model?.endpoint?.supported_parameters?.includes("tools") || model?.endpoint?.model?.supported_parameters?.includes("tools");
		const warningMessage = model?.endpoint?.model?.warning_message || model?.warning_message;
		const api_key_required = warningMessage && warningMessage.includes("your own API key") && warningMessage.includes("https://openrouter.ai/settings/integrations");


		const modelData = {
			id,
			openRouterId,
			name,
			description,
			features: {
				vision: inputMods.includes("image"),
				imageGeneration: outputMods.includes("image"),
				objectGeneration: outputMods.includes("object"),
				reasoning: isReasoning,
				pdfSupport: inputMods.includes("file"),
				search: toolSupported,
				fast: name.includes("fast") || name.includes("turbo") || name.includes("speed") || name.includes("Fast") || name.includes("Turbo") || name.includes("Speed"),
				experimental: name.includes("experimental") || name.includes("exp")
			},
			api_key_required: typeof api_key_required === "boolean" ? api_key_required : false,
			provider,
			available: !(model?.hidden || false),
			enabled: !(model?.hidden || false),
			is_fallback: false,
			premium: !is_free
		};

		if (!provider) return null;
		if (provider.length === 0) return null;

		return modelData;
	}

	const response = await axios.get("https://openrouter.ai/api/frontend/models/find").then(res => res.data);
	const models: AgentModel[] = [];

	const allModels = Promise.all(
		response.data.models.map((model: any) => {
			return parseModel(model)
				.catch((error) => {
					return null;
				});
		})
	);

	await MonguzAgent.deleteMany({});

	const parsedModels = await allModels;
	for (const model of parsedModels) {
		if (model) {
			if (models.some(m => m.id === model.id)) {
				console.warn(`Duplicate model found: ${model.id}, skipping...`);
				return;
			}

			const existingModel = await MonguzAgent.findOne({ id: model.id }).lean().exec();
			if (existingModel) {
				console.log(`Model already exists in database: ${model.id}, skipping...`);
				continue;
			}

			models.push(model);
		}
	}

	await MonguzAgent.insertMany(models);


	// fs.writeFileSync("models.json", JSON.stringify(models, null, 4));
})();

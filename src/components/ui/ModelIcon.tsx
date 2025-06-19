import {
	Gemini,
	Anthropic,
	OpenAI,
	DeepSeek,
	Mistral,
	Qwen,
	Meta,
	Grok,
	Microsoft,
	Replicate,
	XAI,
	Cohere,
	Groq,
	Yi,
	Nova
} from "@lobehub/icons";
import { RoboticIcon } from "hugeicons-react";

export default function ModelIcon({ model, ...props }: { model: string | null } & any) {
	const Icon = (() => {
		switch (model?.toLowerCase()) {
			case 'openai':
				return OpenAI;
			case 'anthropic':
				return Anthropic;
			case 'gemini':
			case 'google':
			case 'google vertex':
			case 'google ai studio':
				return Gemini;
			case 'meta':
				return Meta;
			case 'mistral':
				return Mistral;
			case 'deepseek':
				return DeepSeek;
			case 'qwen':
			case 'qwen3':
				return Qwen;
			case 'grok':
				return Grok;
			case 'microsoft':
				return Microsoft;
			case 'replicate':
				return Replicate;
			case 'xai':
				return XAI;
			case 'cohere':
				return Cohere;
			case 'groq':
				return Groq;
			case 'yi':
				return Yi;
			case 'nova':
				return Nova;
			case 'other':
				return RoboticIcon;
			default:
				return RoboticIcon;
		}
	})();

	return <Icon {...props} />;
}
import { Types } from 'mongoose';
import { z } from 'zod';

export const useThemeSchema = z.object({
	theme: z.string(),
	setTheme: z.function().args(z.string()).returns(z.void())
});
export type useThemeSchema = z.infer<typeof useThemeSchema>;

export const agentModelSchema = z.object({
	provider: z.string().default('OpenAI'),
	openRouterId: z.string().optional().nullable(), // OpenRouter Id
	id: z.string(),
	name: z.string(),
	description: z.string(),
	version: z.string().optional().nullable().default(null),
	features: z.object({
		vision: z.boolean().optional(),
		imageGeneration: z.boolean().optional(),
		objectGeneration: z.boolean().optional(),
		reasoning: z.boolean().optional(),
		pdfSupport: z.boolean().optional(),
		search: z.boolean().optional(),
		effortControl: z.boolean().optional(),
		fast: z.boolean().optional(),
		experimental: z.boolean().optional()
	}).partial().default({}),
	enabled: z.boolean(),
	available: z.boolean(),
	premium: z.boolean().optional(),
	is_fallback: z.boolean().optional().default(false)
});
export type AgentModel = z.infer<typeof agentModelSchema>;

export const z3cModelSchema = z.object({
	_id: z.string(),
	name: z.string(),
	description: z.string(),
	instructions: z.string(),
	profile_image: z.string().optional().nullable(),
	likes: z.number().int().min(0).default(0),
	downloads: z.number().int().min(0).default(0),
	conversations: z.number().int().min(0).default(0),
	createdAt: z.date(),
	updatedAt: z.date(),
	category: z.string().optional().nullable()
});
export type Z3cModel = z.infer<typeof z3cModelSchema>;

export const z3Schema = z.object({
	agents: z.array(agentModelSchema).default([]),
	cookies: z.array(z.object({
		name: z.string(),
		value: z.string(),
	})),
	defaultAgent: agentModelSchema.optional().nullable(),
	selectedAgent: agentModelSchema.optional().nullable(),
	changeAgent: z.function().args(z.string().nullable())
		.returns(z.void()),
	features: z.object({
		search: z.boolean().optional(),
		reasoning: z.boolean().optional(),
	}).default({}),
	setFeature: z.function().args(z.string(), z.any())
		.returns(z.void()),
	prompt: z.string().default(''),
	setPrompt: z.function().args(z.string())
		.returns(z.void()),
	isEnhancing: z.boolean().default(false),
	enhancePrompt: z.function().args().returns(z.void()),
	enhanceRemaining: z.number().int().min(0).default(0),
	alert: z.string().nullable().default(null),
	setAlert: z.function().args(z.string().nullable()),
	setAlertDuration: z.function().args(z.number().int().min(0))
		.returns(z.void()),
	alertDuration: z.number().int().min(0).default(5000),
	attachments: z.array(z.object({
		id: z.string(),
		name: z.string(),
		type: z.string(),
		size: z.number(),
		preview: z.string(),
		extension: z.string(),
		uploading: z.boolean().optional()
	})).default([]),
	setAttachments: z.function().args(z.array(z.object({
		id: z.string(),
		name: z.string(),
		type: z.string(),
		size: z.number(),
		preview: z.string(),
		extension: z.string(),
		uploading: z.boolean().optional()
	}))).returns(z.void()),
	installedZ3Cs: z.array(z3cModelSchema).default([])
});

export const initZ3Schema = z3Schema.pick({ agents: true, defaultAgent: true, installedZ3Cs: true });
export type Z3Schema = z.infer<typeof z3Schema>;
export type InitZ3Schema = z.infer<typeof initZ3Schema>;

export const chatProviderMessageSchema = z.object({
	_id: z.string().optional().nullable(),
	type: z.enum(['text', 'reasoning', 'error', 'line-message', 'waiting']).optional().default('text'),
	agentId: z.string().optional().nullable(),
	role: z.enum(['user', 'assistant']),
	content: z.string(),
	chatId: z.string().optional(),
	createdAt: z.date().optional(),
	agentOptions: z.record(z.any()).optional().nullable().default({}),
	vote: z.enum(['up', 'down', 'neutral']).optional().default('neutral'),
	streaming: z.boolean().optional().default(false),
});

export type ChatProviderMessage = z.infer<typeof chatProviderMessageSchema>;

export const chatProviderChatContextSchema = z.object({
	messages: z.array(chatProviderMessageSchema),
	setMessages: z.function()
		.args(z.array(chatProviderMessageSchema))
		.returns(z.array(chatProviderMessageSchema).optional())
});

export type ChatProviderChatContext = z.infer<typeof chatProviderChatContextSchema>;

export const useChatOptionsSchema = z.object({
	initialMessages: z.array(z.string()).optional(),
	disableSubmittion: z.boolean().optional(),
	isResponding: z.boolean().optional().default(false),
	setIsResponding: z.function().args(z.boolean()).returns(z.void()).optional(),
	attachments: z.array(z.object({
		name: z.string(),
		type: z.string(),
		size: z.number(),
		preview: z.string(),
	})).optional(),
});

export type UseChatOptions = z.infer<typeof useChatOptionsSchema>;

export type MessageDocument = {
	_id: string;
	chatId: Types.ObjectId;
	role: 'user' | 'assistant' | 'system';
	agentOptions?: Record<string, any>;
	content: string;
	createdAt: Date;
	agentId?: string;
};
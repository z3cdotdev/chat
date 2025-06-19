"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { useAutoSubmit } from "@/stores/use-auto-submit";
import { useMessages } from "@/hooks/use-messages";
import { AxiosResponse } from "axios";
import { UseChatOptions } from '@/lib/definitions';
import { useScrollDown } from "@/hooks/use-scroll-down";
import { processDataStream } from "ai";
import { fillMessageParts } from "@ai-sdk/ui-utils";
import { toast } from "sonner";
import { usePromptStore } from "@/stores/use-prompt";
import { useEnhanceStore } from "@/stores/use-enhance";
import { useAgentSelectionStore } from "@/stores/use-agent-selection";
import { useAlertStore } from "@/stores/use-alert";
import { useAgentFeatureStore } from "@/stores/use-feature-store";
import { useAttachmentsStore } from "@/stores/use-attachments";
import { useIsConversationCreating } from "@/stores/use-is-conversation-creating";
import { useZ3cSelectionStore } from "@/stores/use-z3cs-select";

export const useChat = (options?: UseChatOptions) => {
	const router = useRouter();
	const params = useParams();

	const prompt = usePromptStore((state) => state.prompt);
	const setPrompt = usePromptStore((state) => state.setPrompt);
	const isEnhancing = useEnhanceStore((state) => state.isEnhancing);
	const model = useAgentSelectionStore((state) => state.selectedAgent);
	const setAlert = useAlertStore((state) => state.setAlert);
	const features = useAgentFeatureStore((state) => state.features);
	const attachments = useAttachmentsStore((state) => state.attachments);
	const setAttachments = useAttachmentsStore((state) => state.setAttachments);
	const selectedZ3C = useZ3cSelectionStore((state) => state.selectedZ3C);

	const autoSubmit = useAutoSubmit(state => state.autoSubmit);
	const setAutoSubmit = useAutoSubmit(state => state.setAutoSubmit);
	const { scrollToBottom, autoScroll } = useScrollDown();
	const { messages, setMessages, streamMessage, addUserMessage, setToolResult, endStreaming, continueStreaming } = useMessages();

	const isCreatingConversation = useIsConversationCreating((state) => state.isCreatingConversation);
	const setIsCreatingConversation = useIsConversationCreating((state) => state.setIsCreatingConversation);

	async function handleStreamMessage(response: AxiosResponse<any, any>, $prompt: string) {
		continueStreaming();
		options?.setIsResponding?.(true);

		const processPart = (partKey: string, partValue: any) => {
			streamMessage({
				type: partKey,
				value: partValue
			}, {
				agentId: model?.id as string,
				agentOptions: features,
				chatId: params?.conversationId as string
			});
		}

		processDataStream({
			stream: response.data,
			onFinishMessagePart: () => {
				endStreaming();
				options?.setIsResponding?.(false);
				if (autoScroll) scrollToBottom();
			},
			onReasoningPart: (reasoning) => processPart('reasoning', reasoning),
			onTextPart: (text) => processPart('text', text),
			onDataPart: (data: any) => {
				data.map((part: any) => {
					if (part.type === 'image') {
						processPart('image', part);
						if (part.state === 'generated') {
							endStreaming();
							options?.setIsResponding?.(false);
							if (autoScroll) scrollToBottom();
						}
					}
					if (part.type === 'error') {
						streamMessage({
							type: 'error',
							value: part.text || 'An error occurred while processing your request.'
						}, {
							agentId: model?.id as string,
							agentOptions: features,
							chatId: params?.conversationId as string,
							text: part.text || 'An error occurred while processing your request.'
						});


						endStreaming();
						options?.setIsResponding?.(false);
						if (autoScroll) scrollToBottom();
					}
				});
			},
			onFilePart: (file) => processPart('file', file),
			onMessageAnnotationsPart: (annotations) => processPart('annotations', annotations),
			onSourcePart: (source) => processPart('source', source),
			onToolCallPart: (toolCall) => processPart('tool-invocation', toolCall),
			onToolResultPart: (toolResult) => setToolResult(toolResult.toolCallId, toolResult.result)
		});
	}

	const sendMessage = useCallback(async (cId?: string) => {
		if (options?.disableSubmittion) return;
		if (isEnhancing) return;
		if (!prompt && attachments.length === 0) return;
		const $prompt = prompt;

		setPrompt("");
		setAttachments([]);

		const conversationId = cId || params?.conversationId as string;

		addUserMessage($prompt);

		try {
			const response = await api.post("/conversation/" + conversationId, {
				model: model?.id as string,
				prompt,
				modelOptions: features,
				attachments,
				z3cId: selectedZ3C?._id || null
			}, {
				adapter: 'fetch',
				responseType: "stream"
			});

			if (!response || !response.data) {
				setAlert("Failed to send message");
				return;
			}

			await handleStreamMessage(response, $prompt);
		} catch (error) {
			console.error('Send message error:', error);
			setAlert("Failed to send message. Please check your connection and try again.");
			options?.setIsResponding?.(false);
		}
	}, [params, prompt, isEnhancing, setPrompt, model, messages, setMessages, options?.disableSubmittion, handleStreamMessage]);

	const createNewConversation = async () => {
		setIsCreatingConversation(true);

		const createPromise = await api.post("/create-conversation", {
			prompt
		})
			.then((res) => res.data)
			.then((response) => {
				if (!response || !response.success) {
					throw new Error(response?.message || "Failed to create conversation");
				}
				return response.data;
			});

		return createPromise;
	};

	const handleSubmit = useCallback(async () => {
		if (options?.disableSubmittion) return;
		if (isEnhancing) return;

		const conversationId = params?.conversationId as string;
		if (!conversationId) {
			try {
				const newConversation = await createNewConversation();
				setMessages([]);
				setAutoSubmit(true);
				router.push(newConversation.redirect, {
					scroll: true
				});
			} catch (error) {
				return;
			}
		} else {
			setAutoSubmit(false);
			sendMessage();
		}
	}, [params, isEnhancing, sendMessage, setMessages, setAutoSubmit, options?.disableSubmittion, router, createNewConversation, setAttachments]);

	useEffect(() => {
		if (autoSubmit && params?.conversationId && isCreatingConversation) {
			setIsCreatingConversation(false);
			handleSubmit();
		}
	}, [autoSubmit, params, handleSubmit, isCreatingConversation, setIsCreatingConversation]);

	useEffect(() => {
		(async () => {
			const isHaveRespondingValue = options?.isResponding || false;
			if (params?.conversationId && isHaveRespondingValue) {
				const resumeResponse = await api.post(`/conversation/${params.conversationId}/resume`, {}, {
					adapter: 'fetch',
					responseType: "stream"
				}).catch(() => null);

				if (!resumeResponse) return;

				await handleStreamMessage(resumeResponse, prompt);
			}
		})();
	}, []);

	return {
		handleSubmit,
		messages: (options?.initialMessages || []).concat(messages as any),
		setMessages,
		isCreatingConversation
	};
};
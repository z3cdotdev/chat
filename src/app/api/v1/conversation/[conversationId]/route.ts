import { Conversation } from "@/database/models/Conversations";
import { Message } from "@/database/models/Messages";
import { ai, getAllModelsArray } from "@/lib/ai";
import { withAuth } from "@/middleware/withAuth";
import { appendResponseMessages, createDataStream, experimental_generateImage, GeneratedFile, smoothStream, streamText } from "ai";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from 'next/server'
import { createResumableStreamContext } from "resumable-stream";
import { after } from "next/server";
import { systemPrompt } from "@/lib/system-prompt";
import { geolocation } from '@vercel/functions';
import { Ratelimit } from "@upstash/ratelimit";
import { ipAddress } from "@vercel/functions";
import { kv } from "@vercel/kv";
import md5 from "md5";
import { getAgentTools } from "@/lib/createTools";
import { z } from "zod";
import { AgentModel } from "@/database/models/Models";
import { AgentModel as TAgentModel } from "@/lib/definitions";
import { put } from "@/lib/blob";
import { v4 as uuidv4 } from 'uuid';
import { Z3Cs } from "@/database/models/Z3Cs";


const streamContext = createResumableStreamContext({
	waitUntil: after
});

const isStillResponding = async (conversationId: string) => {
	const isHaveResume = await Message.findOne({
		chatId: conversationId,
		role: 'assistant',
		resume: true
	}).lean();
	return !!isHaveResume;
};

export const GET = async (
	request: NextRequest,
	{ params }: any
) => {
	return await withAuth(async (session) => {
		const { conversationId } = await params;
		if (!conversationId) return Response.json({ success: false, message: 'Conversation ID is required' }, { status: 400 });

		if (isValidObjectId(conversationId) === false) {
			return Response.json({ success: false, message: 'Invalid conversation ID' }, { status: 400 });
		}

		const isExists = await Conversation.exists({ _id: conversationId, userId: session.user.id });
		let isSharedState = false;
		if (!isExists) {
			const isShared = await Conversation.exists({
				'shared._id': conversationId
			});

			if (!isShared) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });
			isSharedState = true;
		}

		const conversation: any = await Conversation.findOne(isSharedState ? {
			'shared._id': conversationId
		} : {
			_id: conversationId,
			userId: session.user.id
		}).populate({
			path: 'messages',
			options: {
				lean: true
			}
		}).lean();

		const getVoteStatedMessages = (messages: any[], ups: string[], downs: string[]) => {
			return messages.map((message) => {
				const isUpvoted = ups.find((up: string) => up.toString() === message._id.toString());
				const isDownvoted = downs.find((down: string) => down.toString() === message._id.toString());

				return {
					...message,
					vote: isUpvoted ? 'up' : isDownvoted ? 'down' : 'neutral'
				};
			});
		}

		if (!isSharedState) {
			return Response.json({
				success: true,
				conversation: Object.assign({}, conversation, {
					is_shared: false,
					lastMessage: conversation.messages.at(-1)?._id || null,
					messages: getVoteStatedMessages(conversation.messages, conversation.votes.ups, conversation.votes.downs),
					votes: undefined,
					isResponding: await isStillResponding(conversationId)
				})
			}, { status: 200 });
		} else {
			const lastMessage = conversation.shared.lastMessageId;
			const messages = conversation.messages.slice(0, conversation.messages.findIndex((m: any) => m._id.toString() === lastMessage.toString()) + 1)

			return Response.json({
				success: true,
				conversation: Object.assign({}, conversation, {
					is_shared: true,
					lastMessage,
					messages: getVoteStatedMessages(messages, conversation.votes.ups, conversation.votes.downs),
					votes: undefined
				})
			}, { status: 200 });
		}
	}, {
		forceAuth: true,
		headers: request.headers
	});
};

type AMT = TAgentModel & any;
export const POST = async (
	request: NextRequest,
	{ params }: any
) => {
	return await withAuth(async (session) => {
		let fn: any;

		try {
			const { conversationId } = await params;
			let { prompt, model, modelOptions, attachments, z3cId } = await request.json();
			if (!prompt && attachments.length === 0) return Response.json({ success: false, message: 'Message is required' }, { status: 400 });
			if (!prompt && attachments.length > 0) prompt = ".";
			if (!model) return Response.json({ success: false, message: 'Model is required' }, { status: 400 });
			const agent: AMT & any = await AgentModel.findOne({ id: model }).lean();
			if (!agent) return Response.json({ success: false, message: 'Invalid model' }, { status: 400 })
			const ip = ipAddress(request) || (!session?.user?.isAnonymous ? session?.user?.id : (process.env.NODE_ENV === 'development' ? '127.0.0.1' : ''));
			if (!ip) {
				return Response.json({
					success: false,
					message: "Unable to determine your IP address.",
				}, { status: 400 });
			}

			const ratelimit = new Ratelimit({
				redis: kv,
				limiter: Ratelimit.slidingWindow((agent?.features?.imageGeneration ? session?.user?.usage_image_generation : session?.user?.usage_models) || 20, '24 h')
			});

			const { success, remaining, limit, reset } = await ratelimit.limit(`models:${md5(ip)}`);

			const increaseLimit = async () => {
				const key = `models:${md5(ip)}`;
				await ratelimit.resetUsedTokens(key);
				await Promise.all(Array.from({ length: ((agent?.features?.imageGeneration ? session?.user?.usage_image_generation : session?.user?.usage_models) || 20) - (remaining + 1) }).map(() => ratelimit.limit(key)));
			};

			if (!success) {
				return Response.json({
					success: false,
					message: `You have reached of your conversation limit. You can try again after ${new Date(reset * 1000).toLocaleString('en-US', {
						timeZone: 'UTC',
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit'
					})}.`,
					rateLimit: {
						remaining,
						limit,
						reset
					}
				}, { status: 429 });
			}

			let z3c: any = z3cId ? await Z3Cs.findOne({ _id: z3cId }).lean() : null;
			if (z3cId && !z3c) {
				z3c = null;
			}

			const tools = getAgentTools(agent as any, modelOptions);

			if (!conversationId) {
				await increaseLimit();
				return Response.json({ success: false, message: 'Conversation ID is required' }, { status: 400 });
			};

			if (isValidObjectId(conversationId) === false) {
				await increaseLimit();
				return Response.json({ success: false, message: 'Invalid conversation ID' }, { status: 400 });
			};

			const models = await getAllModelsArray();
			const requestModel = models.find(m => m === model);

			if (!requestModel) {
				await increaseLimit();
				return Response.json({ success: false, message: 'Invalid model' }, { status: 400 });
			};

			const conversation = await Conversation.findOne({
				_id: conversationId,
				userId: session.user.id
			}).select('-messages').lean();

			if (!conversation) {
				await increaseLimit();
				return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });
			};

			const existingRespond = await Message.findOne({
				chatId: conversationId,
				role: 'assistant',
				resume: true
			}).lean();

			if (existingRespond) {
				await increaseLimit();

				return Response.json({
					success: false,
					message: 'There is already an ongoing response for this conversation. Please wait for it to finish or delete the conversation.',
					conversationId
				}, { status: 400 });
			};


			const attachmentsSchema = z.array(z.object({
				name: z.string().min(1, 'Attachment name is required'),
				preview: z.string().url('Invalid attachment URL'),
				type: z.string().min(1, 'Attachment type is required')
			})).safeParse(attachments);

			if (!attachmentsSchema.success) {
				await increaseLimit();

				return Response.json({
					success: false,
					message: 'Invalid attachments',
					errors: attachmentsSchema.error.errors
				}, { status: 400 });
			}

			const experimentalAttachments = attachments.map((attachment: any) => ({
				name: attachment.name,
				url: attachment.preview,
				contentType: attachment.type
			}));

			const newMessage = new Message({
				chatId: conversationId,
				role: 'user',
				parts: [
					{
						type: 'text',
						text: prompt as string
					}
				],
				experimental_attachments: experimentalAttachments,
				createdAt: new Date()
			});

			await newMessage.save();

			await Conversation.updateOne(
				{ _id: conversationId, userId: session.user.id },
				{
					$push: { messages: newMessage._id }
				}
			);

			const messages = (await Message.find({
				chatId: conversationId
			}).sort({ createdAt: 1 }).lean()).map((m) => ({
				role: m.role as 'user' | 'assistant' | 'system',
				content: m.parts.filter((part: any) => part.type === 'text').map((part: any) => part.content).join(' '),
				experimental_attachments: m.experimental_attachments
			})).concat([{
				role: 'user',
				content: prompt as string,
				experimental_attachments: experimentalAttachments
			}]);

			const responseMessage = new Message({
				chatId: conversationId,
				role: 'assistant',
				parts: [],
				resume: true,
				agentId: requestModel,
				agentOptions: modelOptions || {},
				experimental_attachments: experimentalAttachments
			});

			await Conversation.updateOne(
				{ _id: conversationId, userId: session.user.id },
				{
					$push: { messages: responseMessage._id }
				}
			);

			await responseMessage.save();

			const d = await ai({ session });
			const details = geolocation(request);

			if ((agent as any)?.features?.imageGeneration) {
				const imageStream = createDataStream({
					execute: async (dataStream) => {
						try {
							dataStream.writeData({
								type: 'image',
								state: 'generating',
								text: '',
								experimental_attachments: []
							});

							const { images } = await experimental_generateImage({
								model: d.imageModel(requestModel),
								prompt: prompt as string
							});

							if (!images || images.length === 0) {
								dataStream.writeData({
									type: 'error',
									text: 'No images generated.'
								});

								await Message.updateOne(
									{ _id: responseMessage._id },
									{
										type: 'error',
										role: 'assistant',
										parts: [
											{
												type: 'error',
												content: 'No images generated.'
											}
										],
										resume: false
									}
								);

								return;
							}

							const uploadedImages = await Promise.all(images.map(async (image: any) => {
								const arr = new Uint8Array(Object.values(image.uint8ArrayData));
								const buffer = Buffer.from(arr);
								const randomId = uuidv4();
								const extension = image?.mimeType?.split?.('/')?.[1];
								const fileName = `${randomId}-generated-z3c-dev.${extension || 'png'}`;
								const file = new File([buffer], fileName, {
									type: image.mimeType
								});
								const upload = await put("chat-files", fileName, file, {
									access: 'public',
									addRandomSuffix: true
								});

								if (!upload) {
									throw new Error('Failed to upload image');
								}

								return {
									name: file.name,
									url: upload.url,
									downloadUrl: upload.downloadUrl,
									contentType: file.type
								};
							}));

							await Message.updateOne(
								{ _id: responseMessage._id },
								{
									role: 'assistant',
									parts: [
										{
											type: 'image',
											state: 'generated',
											experimental_attachments: uploadedImages,
										}
									],
									experimental_attachments: uploadedImages,
									resume: false
								}
							);

							dataStream.writeData({
								type: 'image',
								state: 'generated',
								text: '',
								experimental_attachments: uploadedImages
							} as any);
						} catch (error) {
							await increaseLimit();

							dataStream.writeData({
								type: 'error',
								text: (error as any)?.message || 'An error occurred while processing your request.'
							});
						}
					}
				});

				return new Response(
					await streamContext.createNewResumableStream(conversationId, () => imageStream),
					{
						status: 200,
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

			} else {
				const stream = createDataStream({
					execute: dataStream => {
						const result = streamText({
							model: d.languageModel(requestModel),
							system: systemPrompt({
								z3c: z3c ? {
									name: z3c.name,
									description: z3c.description,
									instructions: z3c.instructions
								} : {},
								preferences: {
									interests: session?.user?.interests || "",
									tone: session?.user?.tone || "neutral",
									bio: session?.user?.bio || "",
								},
								geolocation: details
							}),
							messages,
							providerOptions: {
								openai: {
									reasoningEffort: (modelOptions.reasoning ? 'low' : undefined) as any
								}
							},
							tools,
							onFinish: async ({ response }) => {
								const [, assistantMessage] = appendResponseMessages({
									messages: [prompt],
									responseMessages: response.messages,
								});

								const dbData = await Message.findOne({ chatId: conversationId, role: 'assistant', resume: true })
									.catch((err) => null);

								if (!dbData) {
									console.error('No assistant message found in database');
									return;
								}

								await Message.updateOne(
									{ _id: dbData._id },
									{
										role: assistantMessage.role,
										parts: assistantMessage.parts,
										experimental_attachments: assistantMessage.experimental_attachments,
										resume: false
									}
								).catch((err) => {
									console.error('Error updating assistant message:', err);
								});
							},
							experimental_transform: smoothStream({ chunking: 'word' }),
							onError: async ({ error }) => {
								try {
									await increaseLimit();

									dataStream.writeData({
										type: 'error',
										text: (error as any)?.message || 'An error occurred while processing your request.'
									});

									const dbData = await Message.findOne({ chatId: conversationId, role: 'assistant', resume: true })
										.catch((err) => null);

									if (!dbData) {
										return;
									}

									await Message.updateOne(
										{ _id: dbData._id },
										{
											type: 'error',
											role: 'assistant',
											parts: [
												{
													type: 'error',
													content: (error as any).message || 'An error occurred while processing your request.'
												}
											],
											resume: false
										}
									).catch((err) => {
										console.error('Error updating assistant message:', err);
									});
								} catch (err) {
									dataStream.writeData({
										type: 'error',
										text: (err as any)?.message || 'An error occurred while processing your request.'
									});
									console.error('Error handling error in stream:', err);
								}
							}
						})

						result.consumeStream();
						return result.mergeIntoDataStream(dataStream, {
							sendReasoning: true,
							sendSources: true
						});
					}
				});

				const str = await streamContext.createNewResumableStream(conversationId, () => stream);

				return new Response(str, {
					status: 200
				});
			}
		} catch (error) {
			if (fn) await fn();

			console.error('Error occurred while processing request:', error);
			return Response.json({
				success: false,
				message: 'An error occurred while processing your request. Please try again later.',
				error: (error as Error).message || 'Unknown error'
			}, { status: 500 });
		}
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
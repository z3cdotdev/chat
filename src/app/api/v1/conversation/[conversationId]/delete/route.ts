import { Conversation } from "@/database/models/Conversations";
import { Message } from "@/database/models/Messages";
import { withAuth } from "@/middleware/withAuth";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from 'next/server';
import {
	del
} from "@vercel/blob";

export const DELETE = async (
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
		if (!isExists) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });

		await Conversation.deleteOne({ _id: conversationId, userId: session.user.id });
		const thisConversationMessages = await Message.find({ chatId: conversationId }).select('_id experimental_attachments').lean();

		if (thisConversationMessages.length > 0) {
			const forkedConversations = await Conversation.find({ forkedFrom: conversationId });
			const deepSearch = async (conversationId: string): Promise<string[]> => {
				const forks = await Conversation.find({ forkedFrom: conversationId }).select('_id').lean();
				const forkIds = forks.map((fork: any) => fork._id.toString());
				let allForks = new Set<string>();
				forkIds.forEach(forkId => allForks.add(forkId));

				for (const forkId of forkIds) {
					const nestedForks = await deepSearch(forkId);
					if (nestedForks.length === 0) continue;
					nestedForks.forEach(nestedForkId => allForks.add(nestedForkId));
				}

				return Array.from(allForks);
			}
			const deepForks = await deepSearch(conversationId);
			const allForks = [...forkedConversations.map(fork => fork._id.toString()), ...deepForks];

			if (allForks.length > 0) {
				for (const forkId of allForks) {
					const forkConversationAuthor: {
						messages: { _id: string; type: string; content: string }[];
						userId: string;
					} & any | null = await Conversation.findOne({ _id: forkId, userId: session.user.id })
						.select('messages userId')
						.populate('messages', '_id type content')
						.lean() as any;
					if (!forkConversationAuthor) continue;

					await Conversation.updateOne(
						{ _id: forkId, userId: forkConversationAuthor.userId },
						{ $pull: { messages: { $in: thisConversationMessages.map(msg => msg._id) } } }
					).catch((e) => {
						console.error('Error removing messages from forked conversation:', e);
					});

					if (forkConversationAuthor.messages.length === 0) continue;
					if (forkConversationAuthor.messages.length > 0) {
						const isHaveBeforeUnavailable = await Message.exists({
							_id: { $in: forkConversationAuthor.messages.map((msg: any) => msg._id) },
							chatId: forkId,
							role: 'system',
							'parts.type': 'line-message',
							'parts.text': 'BEFORE_MESSAGES_NOT_AVAILABLE'
						});

						if (!isHaveBeforeUnavailable) {
							const lineMessage = new Message({
								role: 'system',
								parts: [
									{
										type: 'line-message',
										text: "BEFORE_MESSAGES_NOT_AVAILABLE"
									}
								],
								chatId: forkId
							});

							const ln = await lineMessage.save().catch(() => null);
							if (ln) {
								await Conversation.updateOne(
									{ _id: forkId, userId: forkConversationAuthor.userId },
									{
										$set: {
											messages: [ln._id, ...forkConversationAuthor.messages]
										}
									}
								).catch((e) => {
									console.error('Error adding line message to forked conversation:', e);
								});
							}
						}
					}
				}
			}
		}

		const attachments = thisConversationMessages.map(msg => msg.experimental_attachments || []).flat();
		if (attachments.length > 0) {
			await del(attachments.map((attachment: any) => attachment.url)).catch((e) => {
				console.error('Error deleting attachments:', e);
			});
		}

		await Message.deleteMany({
			_id: { $in: thisConversationMessages.map(msg => msg._id) },
			chatId: conversationId
		}).catch((e) => {
			console.error('Error deleting conversation messages:', e);
		});

		await Conversation.deleteOne({ _id: conversationId, userId: session.user.id }).catch((e) => {
			console.error('Error deleting conversation:', e);
		});

		return Response.json({
			success: true,
			message: 'Conversation deleted successfully'
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
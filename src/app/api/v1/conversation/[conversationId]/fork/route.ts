import { Conversation } from "@/database/models/Conversations";
import { Message, MessageDocument } from "@/database/models/Messages";
import { withAuth } from "@/middleware/withAuth";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from 'next/server';

export const POST = async (
	request: NextRequest,
	{ params }: any
) => {
	return await withAuth(async (session) => {
		const { conversationId } = await params;
		let { messageId, findBy } = await request.json();
		if (!messageId) return Response.json({ success: false, message: 'Message ID is required' }, { status: 400 });
		if (!findBy) return Response.json({ success: false, message: 'Find by is required' }, { status: 400 });
		if (findBy !== 'object_id' && findBy !== 'index') return Response.json({ success: false, message: 'Invalid find by value' }, { status: 400 });
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

		const conv = await Conversation.findOne(isSharedState ? {
			'shared.enabled': true,
			'shared._id': conversationId
		} : {
			_id: conversationId,
			userId: session.user.id
		}).populate({
			path: 'messages',
			select: '_id'
		});

		if (!conv) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });
		const messages = conv.messages as MessageDocument[];

		let messageToFork: any | null = null;
		if (findBy === 'object_id') {
			messageToFork = messages.find((msg: any) => msg._id.toString() === messageId) || null;
		} else if (findBy === 'index') {
			const index = parseInt(messageId, 10);
			if (isNaN(index) || index < 0 || index >= messages.length) {
				return Response.json({ success: false, message: 'Invalid message index' }, { status: 400 });
			}
			messageToFork = messages[index] || null;
		}

		if (!messageToFork) {
			return Response.json({ success: false, message: 'Message not found' }, { status: 404 });
		}

		const fromId = messageToFork._id.toString();

		const messageBeforeFromId = messages.findIndex((msg: any) => msg._id.toString() === fromId);
		if (messageBeforeFromId === -1) {
			return Response.json({ success: false, message: 'Message not found before the specified ID' }, { status: 404 });
		}

		const beforeMessages = messages.slice(0, messageBeforeFromId).map((msg: any) => msg._id.toString()).concat(fromId);

		const cloneMessages = await Message.find({
			_id: { $in: beforeMessages }
		}).lean();

		if (cloneMessages.length === 0) {
			return Response.json({ success: false, message: 'No messages found before the specified ID' }, { status: 404 });
		}

		const newConversation = await Conversation.create({
			...conv,
			userId: session.user.id,
			messages: cloneMessages.map(msg => msg._id),
			forkedFrom: conversationId,
			shared: {
				enabled: false,
				lastMessageId: null
			}
		});


		if (isSharedState) {
			const lineMessage = new Message({
				role: 'system',
				content: "FORKED_PUBLIC_CONVERSATION",
				chatId: newConversation._id,
				type: 'line-message'
			});

			const ln = await lineMessage.save().catch(() => null);

			if (ln) {
				await Conversation.updateOne(
					{ _id: newConversation._id },
					{ $push: { messages: lineMessage._id } }
				).catch((e) => {
					console.error('Error updating conversation with line message:', e);
				});
			}
		}

		return Response.json({
			success: true,
			message: 'Message forked successfully',
			data: {
				fromId,
				beforeMessages,
				redirect: `/chats/${newConversation._id.toString()}`,
			}
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
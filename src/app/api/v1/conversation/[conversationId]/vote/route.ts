import { Conversation } from "@/database/models/Conversations";
import { Message, MessageDocument } from "@/database/models/Messages";
import { withAuth } from "@/middleware/withAuth";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from 'next/server';
import { AnyAaaaRecord } from "node:dns";

export const POST = async (
	request: NextRequest,
	{ params }: any
) => {
	return await withAuth(async (session) => {
		const { conversationId } = await params;
		const { vote, messageId, findBy } = await request.json();

		const validVotes = ['up', 'down'];
		if (!vote || !validVotes.includes(vote)) {
			return Response.json({ success: false, message: 'Invalid vote value. Use "up" or "down".' }, { status: 400 });
		}

		if (!messageId && messageId !== 0) {
			return Response.json({ success: false, message: 'Message ID is required' }, { status: 400 });
		}

		if (!conversationId) return Response.json({ success: false, message: 'Conversation ID is required' }, { status: 400 });

		if (isValidObjectId(conversationId) === false) {
			return Response.json({ success: false, message: 'Invalid conversation ID' }, { status: 400 });
		}

		const isExists = await Conversation.exists({ _id: conversationId, userId: session.user.id });
		if (!isExists) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });

		const conversation: any = await Conversation.findOne({
			_id: conversationId,
			userId: session.user.id
		}).select('votes').lean();

		const messages = await Message.find(findBy === 'object_id' ? {
			_id: messageId
		} : {
			chatId: conversationId
		}).select('_id').lean();

		let message: {
			_id: string;
		} & any | null = null;

		if (findBy === 'object_id') {
			message = messages.find((msg: any) => msg._id.toString() === messageId) || null;
		} else if (findBy === 'index') {
			const index = parseInt(messageId as string);
			if (!isNaN(index) && index >= 0 && index < messages.length) {
				message = messages[index];
			}
		} else {
			// Default behavior: try both
			message = messages.find((msg: any) => msg._id.toString() === messageId) || null;
			if (!message) {
				const index = parseInt(messageId as string);
				if (!isNaN(index) && index >= 0 && index < messages.length) {
					message = messages[index];
				}
			}
		}

		if (!message) return Response.json({
			success: false,
			message: `Message not found. Total assistant messages: ${messages.length}, findBy: ${findBy}, messageId: ${messageId}`
		}, { status: 404 });

		const isUpvoted = conversation.votes.ups.find((up: string) => up.toString() === message._id.toString());
		const isDownvoted = conversation.votes.downs.find((down: string) => down.toString() === message._id.toString());
		const isNeutral = !isUpvoted && !isDownvoted;

		if (!isNeutral) return Response.json({ success: false, message: 'Message already voted' }, { status: 400 });

		if (vote === 'up') {
			await Conversation.updateOne(
				{ _id: conversationId, userId: session.user.id },
				{ $push: { 'votes.ups': message._id } }
			).catch((e) => {
				console.error('Error updating conversation votes:', e);
			});
		};

		if (vote === 'down') {
			await Conversation.updateOne(
				{ _id: conversationId, userId: session.user.id },
				{ $push: { 'votes.downs': message._id } }
			).catch((e) => {
				console.error('Error updating conversation votes:', e);
			});
		}

		return Response.json({
			success: true,
			message: 'Vote cast successfully',
			data: {
				vote: vote === 'up' ? 'up' : 'down'
			}
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
import { Conversation } from "@/database/models/Conversations";
import { MessageDocument } from "@/database/models/Messages";
import { withAuth } from "@/middleware/withAuth";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from 'next/server';

export const POST = async (
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

		const conv = await Conversation.findOne({
			_id: conversationId,
			userId: session.user.id
		}).populate({
			path: 'messages',
			select: '_id'
		});
		if (!conv) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });
		const lastMessage = conv.messages.at(-1) as MessageDocument;
		if (!lastMessage) return Response.json({ success: false, message: 'No messages found in the conversation' }, { status: 404 });

		const share = {
			enabled: true,
			lastMessageId: lastMessage._id
		};

		await Conversation.updateOne(
			{ _id: conversationId, userId: session.user.id },
			{ $set: { shared: share } }
		).catch((e) => {
			console.error('Error updating share status:', e);
			return Response.json({ success: false, message: 'Failed to update share status' }, { status: 500 });
		});

		const shareData = await Conversation.findOne({
			_id: conversationId,
			userId: session.user.id
		}).select('shared').lean().then((conv: any) => conv?.shared || null).catch((e) => {
			console.error('Error fetching share data:', e);
			return null;
		});

		return Response.json({
			success: true,
			message: 'Message shared successfully',
			data: shareData
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
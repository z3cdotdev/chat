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

		const isExists = await Conversation.exists({ _id: conversationId, userId: session.user.id, 'shared.enabled': true });
		if (!isExists) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });

		await Conversation.updateOne(
			{ _id: conversationId, userId: session.user.id },
			{
				$set: {
					'shared.enabled': false,
					'shared.lastMessageId': null
				}
			}
		).catch((e) => {
			console.error('Error updating share status:', e);
			return Response.json({ success: false, message: 'Failed to update share status' }, { status: 500 });
		});

		return Response.json({
			success: true,
			message: 'Message unshared successfully'
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
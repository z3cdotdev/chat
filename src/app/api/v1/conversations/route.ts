import { Conversation } from "@/database/models/Conversations";
import { Message } from "@/database/models/Messages";
import { withAuth } from "@/middleware/withAuth";
import { cookies } from "next/headers";
import { type NextRequest } from 'next/server';

const isStillResponding = async (conversationId: string) => {
	const isHaveResume = await Message.findOne({
		chatId: conversationId,
		role: 'assistant',
		resume: true
	}).lean();
	return !!isHaveResume;
};

export const GET = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const sidebar = request.nextUrl.searchParams.get('sidebar') === '1';
		const pinned = (await cookies()).get('pinnedConversations')?.value;
		const pinnedIds = typeof pinned === 'string' && pinned.length > 0
			? pinned.split(',').map(id => id.trim())
			: [];

		const limit = request.nextUrl.searchParams.get('limit') || null;

		const contentLength = await Conversation.countDocuments({
			userId: session.user.id
		}).lean();

		const searchQuery: {
			_id?: { $nin: string[] };
			userId: string;
		} = { userId: session.user.id };
		if (sidebar) searchQuery._id = {
			$nin: pinnedIds
		};

		const conversations = await Conversation.find(searchQuery)
			.limit(limit ? parseInt(limit) : contentLength)
			.select('-messages')
			.sort({ updatedAt: -1 })
			.lean();

		for (const conversation of conversations) {
			const isResponding = await isStillResponding((conversation as any)._id);
			conversation.isResponding = isResponding;
		}

		if (sidebar) {
			const pinnedConversations = await Conversation.find({
				userId: session.user.id,
				_id: {
					$in: pinned ? pinnedIds : []
				}
			})
				.select('-messages')
				.sort({ updatedAt: -1 })
				.lean();

			for (const conversation of pinnedConversations) {
				const isResponding = await isStillResponding((conversation as any)._id);
				conversation.isResponding = isResponding;
			}

			return Response.json({
				success: true,
				conversations,
				pinnedConversations,
			}, { status: 200 });
		}

		return Response.json({
			success: true,
			conversations
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
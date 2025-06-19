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
		const userChats = await Conversation.find({
			userId: session.user.id,
		}).sort({ updatedAt: -1 }).lean();

		const allAttachments = await Message.find({
			chatId: { $in: userChats.map(chat => chat._id) },
			experimental_attachments: { $exists: true, $ne: [] }
		}, {
			experimental_attachments: 1,
			chatId: 1
		}).lean();

		const uniqueAttachments = allAttachments.reduce((acc: any[], curr: any) => {
			if (curr.experimental_attachments && curr.experimental_attachments.length > 0) {
				curr.experimental_attachments.forEach((attachment: any) => {
					if (!acc.some(item => item.url === attachment.url)) {
						acc.push(attachment);
					}
				});
			}
			return acc;
		}, []);

		return Response.json({
			data: uniqueAttachments
		}, {
			status: 200,
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
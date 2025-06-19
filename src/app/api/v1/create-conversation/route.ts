import { Conversation } from "@/database/models/Conversations";
import { ai } from "@/lib/ai";
import { withAuth } from "@/middleware/withAuth";
import { generateText } from "ai";
import { type NextRequest } from 'next/server';
import { after } from 'next/server'

export const POST = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const { prompt } = await request.json();

		const conversation = new Conversation({
			title: "...",
			originalPrompt: prompt,
			userId: session.user.id,
		});

		const savedConversation = await conversation.save().catch(() => null);

		if (!savedConversation) return Response.json({
			success: false,
			message: "Failed to create conversation"
		}, { status: 500 });

		after(async () => {
			const response = await generateText({
				model: (await ai({ session })).languageModel("title-0"),
				messages: [
					{
						role: 'user',
						content: `
- you will generate a short title based on the first message a user begins a conversation with
- ensure it is not more than 80 characters long
- the title should be a summary of the user's message
- do not use quotes or colons
- use input language of the user for the title
- do not use any special characters or emojis
- just return the title, no other text

Here is the original prompt:
${prompt}
							`
					}
				],
				maxTokens: 128,
				temperature: 0.7
			}).catch(() => null);

			if (response && response.text) {
				await Conversation.updateOne({ _id: savedConversation._id }, { $set: { title: response.text } });
			} else {
				await Conversation.updateOne({ _id: savedConversation._id }, { $set: { title: "New Conversation" } });
			}
		});

		return Response.json({
			success: true,
			message: "OK",
			data: {
				id: savedConversation._id,
				prompt: prompt,
				redirect: `/chats/${conversation._id}`
			}
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
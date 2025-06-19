import { withAuth } from "@/middleware/withAuth";
import { type NextRequest } from 'next/server'

import { createResumableStreamContext } from "resumable-stream";
import { after } from "next/server";

const streamContext = createResumableStreamContext({
	waitUntil: after
});

export const POST = async (
	request: NextRequest,
	{ params }: any
) => {
	return await withAuth(async (session) => {
		const { conversationId } = await params;
		const { resumeAt } = await request.json();

		const stream = await streamContext.resumeExistingStream(
			conversationId,
			resumeAt ? parseInt(resumeAt) : undefined
		);

		if (!stream) {
			return new Response("Stream is already done", {
				status: 422,
			});
		}
		return new Response(stream, {
			status: 200
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
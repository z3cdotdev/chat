import { ai } from "@/lib/ai";
import { withAuth } from "@/middleware/withAuth";
import { Ratelimit } from "@upstash/ratelimit";
import { ipAddress } from "@vercel/functions";
import { kv } from "@vercel/kv";
import { generateText } from "ai";
import md5 from "md5";
import { type NextRequest } from 'next/server';


export const POST = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		let fn: any;

		try {
			const ip = ipAddress(request) || (!session?.user?.isAnonymous ? session?.user?.id : (process.env.NODE_ENV === 'development' ? '127.0.0.1' : ''));
			if (!ip) {
				return Response.json({
					success: false,
					message: "Unable to determine your IP address.",
				}, { status: 400 });
			}

			const ratelimit = new Ratelimit({
				redis: kv,
				limiter: Ratelimit.slidingWindow(session?.user?.usage_enhance || 20, '24 h')
			});

			const { success, remaining, limit, reset } = await ratelimit.limit(`prompt-enhancement:${md5(ip)}`);

			const increaseLimit = async () => {
				const key = `prompt-enhancement:${md5(ip)}`;
				await ratelimit.resetUsedTokens(key);
				await Promise.all(Array.from({ length: (session?.user?.usage_enhance || 20) - (remaining + 1) }).map(() => ratelimit.limit(key)));
			};

			fn = increaseLimit;

			if (!success) {
				return Response.json({
					success: false,
					message: `You have reached of your prompt enhancement limit. Please try at ${new Date(reset).toLocaleDateString("en-US", {
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

			const { prompt } = await request.json();

			const response = await generateText({
				model: (await ai({ session })).languageModel("enhancment-0"),
				messages: [
					{
						role: 'user',
						content: `
Enhance the following user prompt by making it more clear, concise, and descriptive. The enhanced prompt should maintain the original intent and context of the user's request. Avoid using special characters and keep it in the same language as the original prompt.
Write in the same language as the original prompt.
- just return the enhanced prompt, no other text

Here is the original prompt:
${prompt}
							`
					}
				],
				maxTokens: 128,
				temperature: 0.7
			});

			if (!response || !response.text) {
				await increaseLimit();

				return Response.json({
					success: false,
					message: "Failed to enhance prompt",
				}, { status: 500 });
			}

			return Response.json({
				success: true,
				message: "Prompt enhanced successfully",
				originalPrompt: prompt,
				prompt: response.text,
				alert: {
					message: `You have ${remaining} prompt enhancements remaining. [Increase your limit](https://z3.chat/pro)`,
					duration: 10000
				},
				rateLimit: {
					remaining,
					limit,
					reset
				}
			});
		} catch (error) {
			if (fn) await fn();

			return Response.json({
				success: false,
				message: "Failed to enhance prompt",
				error
			}, { status: 500 });
		}
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
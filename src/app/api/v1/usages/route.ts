import { ai } from "@/lib/ai";
import { withAuth } from "@/middleware/withAuth";
import { Ratelimit } from "@upstash/ratelimit";
import { ipAddress } from "@vercel/functions";
import { kv } from "@vercel/kv";
import { generateText } from "ai";
import md5 from "md5";
import { type NextRequest } from 'next/server';


export const GET = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const ip = ipAddress(request) || (!session?.user?.isAnonymous ? session?.user?.id : (process.env.NODE_ENV === 'development' ? '127.0.0.1' : ''));
		if (!ip) {
			return Response.json({
				success: false,
				message: "Unable to determine your IP address.",
			}, { status: 400 });
		}

		const enhanceLimit = new Ratelimit({
			redis: kv,
			limiter: Ratelimit.slidingWindow(session?.user?.usage_enhance || 20, '24 h')
		});

		const modelsLimit = new Ratelimit({
			redis: kv,
			limiter: Ratelimit.slidingWindow(session?.user?.usage_models || 10, '24 h')
		});

		const modelsRemaning = await modelsLimit.getRemaining("models:" + md5(ip));
		const enhanceRemaning = await enhanceLimit.getRemaining("prompt-enhancement:" + md5(ip));

		return Response.json({
			success: true,
			message: "OK",
			data: {
				models: {
					remaining: modelsRemaning.remaining,
					limit: session?.user?.usage_models || 20,
					reset: new Date(modelsRemaning.reset).toLocaleString('en-US', {
						timeZone: 'UTC',
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit'
					})
				},
				promptEnhancement: {
					remaining: enhanceRemaning.remaining,
					limit: session?.user?.usage_enhance || 20,
					reset: new Date(enhanceRemaning.reset).toLocaleString('en-US', {
						timeZone: 'UTC',
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit'
					})
				}
			}
		}, {
			status: 200
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
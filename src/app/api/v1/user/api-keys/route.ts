import { ApiKeys } from '@/database/models/ApiKeys';
import { withAuth } from '@/middleware/withAuth';
import { type NextRequest } from 'next/server';
import axios from 'axios';

export const GET = (request: NextRequest) => withAuth(async session => {
	try {
		const keys = await ApiKeys.find({ user: session.user.id }).catch(() => []);
		return Response.json({ success: true, data: keys.map(k => ({ provider: k.provider, key: k.key })) }, { status: 200 });
	} catch (e) {
		return Response.json({ success: false, message: 'Failed to fetch API keys' }, { status: 500 });
	};
}, {
	forceAuth: true,
	headers: request.headers
});

export const PATCH = (request: NextRequest) => withAuth(async session => {
	const modify: Record<string, string> = {};
	const body = await request.json();

	if (body.openai) {
		const response = await axios.get('https://api.openai.com/v1/models', {
			headers: {
				'Authorization': `Bearer ${body.openai}`
			}
		}).catch(() => ({} as any));

		if (!(response.data?.data && response.status === 200)) return Response.json({ success: false, message: 'Invalid OpenAI API key' }, { status: 400 });
		modify.openai = body.openai;
	} else if (typeof body.openai === 'string') {
		modify.openai = '';
	};

	if (body.gemini) {
		const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
			params: {
				key: body.gemini
			}
		}).catch(() => ({} as any));

		if (!(response.data?.nextPageToken && response.status === 200)) return Response.json({ success: false, message: 'Invalid Gemini API key' }, { status: 400 });
		modify.gemini = body.gemini;
	} else if (typeof body.gemini === 'string') {
		modify.gemini = '';
	};

	if (body.anthropic) {
		const response = await axios.get('https://api.anthropic.com/v1/models', {
			headers: {
				'x-api-key': body.anthropic,
				'anthropic-version': '2023-06-01'
			}
		}).catch(() => ({} as any));

		if (!(response.data?.data && response.status === 200)) return Response.json({ success: false, message: 'Invalid Anthropic API key' }, { status: 400 });
		modify.anthropic = body.anthropic;
	} else if (typeof body.anthropic === 'string') {
		modify.anthropic = '';
	};

	if (body.replicate) {
		const response = await axios.get('https://api.replicate.com/v1/models', {
			headers: {
				'Authorization': `Bearer ${body.replicate}`
			}
		}).catch(() => ({} as any));

		if (!(response.data?.results && response.status === 200)) return Response.json({ success: false, message: 'Invalid Replicate API key' }, { status: 400 });
		modify.replicate = body.replicate;
	} else if (typeof body.replicate === 'string') {
		modify.replicate = '';
	};

	await Promise.all(Object.entries(modify).map(([provider, key]) => ApiKeys.updateOne({ user: session.user.id, provider }, { $set: { key } }, { upsert: true })));
	return Response.json({ success: true, message: 'API keys updated' }, { status: 200 });
}, {
	forceAuth: true,
	headers: request.headers
});
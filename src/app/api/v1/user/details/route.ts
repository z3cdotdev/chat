import { withAuth } from '@/middleware/withAuth';
import { type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export const PATCH = (request: NextRequest) => withAuth(async () => {
	const modify: Record<string, string> = {};
	const body = await request.json();

	if (body.interests) modify.interests = body.interests.slice(0, 64);
	if (body.tone) modify.tone = body.tone.slice(0, 24);
	if (body.bio) modify.bio = body.bio.slice(0, 256);

    const res = await auth.api.updateUser({
        body: modify,
        headers: request.headers
    });

    if (!res.status) return Response.json({ success: false, message: 'Failed to update details' }, { status: 500 });
	return Response.json({ success: true, message: 'Details updated' }, { status: 200 });
}, {
	forceAuth: true,
	headers: request.headers
});
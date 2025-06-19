import { put } from "@/lib/blob";
import { withAuth } from "@/middleware/withAuth";
import { type NextRequest } from 'next/server';

export const POST = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		try {
			const filename = request.nextUrl.searchParams.get('filename') || '';
			const form = await request.formData();
			const file = form.get('file') as File;

			if (!file) throw new Error('Image is required');
			if (!filename) throw new Error('Filename is required');

			const blob = await put('chat-files', filename, file, {
				access: 'public',
				addRandomSuffix: true
			});

			return blob;
		} catch (error) {
			console.error(error);
			return new Response('Internal Server Error', { status: 500 });
		}
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
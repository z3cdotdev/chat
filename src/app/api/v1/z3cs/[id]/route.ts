import { withAuth } from "@/middleware/withAuth";
import { type NextRequest } from 'next/server';
import { Z3Cs } from "@/database/models/Z3Cs";
import { userRaw } from "@/database/models/UserRaw";

export const PUT = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	return await withAuth(async (session) => {
		const { id } = await params;
		const z3c = await Z3Cs.findOne({ _id: id, author: session?.user?.id }).lean().exec();

		if (!z3c) {
			return Response.json({
				success: false,
				message: "Z3C not found"
			}, { status: 404 });
		}

		const formData = await request.json();
		const name = formData.name;
		const profile_image = formData.profile_image;
		const instructions = formData.instructions;
		const description = formData.description;

		await Z3Cs.updateOne({ _id: id }, {
			$set: {
				name,
				profile_image,
				instructions,
				description
			}
		}).exec();

		return Response.json({
			success: true,
			message: "Z3C updated"
		});

	}, {
		forceAuth: true,
		headers: request.headers
	})
};


export const DELETE = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	return await withAuth(async (session) => {
		const { id } = await params;
		const z3c = await Z3Cs.findOne({ _id: id, author: session?.user?.id }).lean().exec();

		if (!z3c) {
			return Response.json({
				success: false,
				message: "Z3C not found"
			}, { status: 404 });
		}

		await Z3Cs.deleteOne({ _id: id }).exec();
		await userRaw.updateMany({ liked_z3cs: id }, { $pull: { liked_z3cs: id } }).exec();
		await userRaw.updateMany({ downloaded_z3cs: id }, { $pull: { downloaded_z3cs: id } }).exec();

		return Response.json({
			success: true,
			message: "Z3C deleted"
		});
	}, {
		forceAuth: false,
		headers: request.headers
	});
}


export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	return await withAuth(async (session) => {
		const { id } = await params;
		const z3c = await Z3Cs.findById(id).populate("author", "_id username image").lean().exec();

		if (!z3c) {
			return Response.json({
				success: false,
				message: "Z3C not found"
			}, { status: 404 });
		}

		// @ts-ignore
		const apps = await Z3Cs.find({ author: z3c.author._id }).limit(3).lean().exec();
		// @ts-ignore
		z3c.author.apps = apps;
		// @ts-ignore
		const inCategory = await Z3Cs.find({ category: z3c.category }).sort({ likes: -1 }).lean().exec();
		// @ts-ignore
		z3c.placement = inCategory.findIndex(app => app._id.toString() === z3c._id.toString()) + 1;
		// @ts-ignore
		const isDownloaded = session?.user?.downloaded_z3cs?.find((m: any) => m.equals(z3c._id));
		// @ts-ignore
		z3c.is_downloaded = isDownloaded;
		// @ts-ignore
		const isLiked = session?.user?.liked_z3cs?.find((m: any) => m.equals(z3c._id));
		// @ts-ignore
		z3c.is_liked = isLiked;

		return Response.json({
			success: true,
			message: "OK",
			data: z3c
		});
	}, {
		forceAuth: false,
		headers: request.headers
	});
};
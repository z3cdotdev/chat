import { AgentModel } from "@/database/models/Models";
import { AgentModel as TAgentModel } from "@/lib/definitions";
import { withAuth } from "@/middleware/withAuth";
import { ObjectId } from "mongoose";
import { type NextRequest } from 'next/server';
import { categories } from "@/constants/categories";
import { Z3Cs } from "@/database/models/Z3Cs";

export const POST = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		if (session.user.isAnonymous) {
			return Response.json({
				success: false,
				message: "Bu işlemi yapmak için giriş yapmalısınız"
			}, { status: 401 });
		}

		const {
			name,
			description,
			category,
			profile_image,
			instructions
		} = await request.json();

		const z3c = await Z3Cs.create({
			name,
			description,
			category,
			profile_image,
			instructions,
			author: session.user.id
		});

		return Response.json({
			success: true,
			message: "Z3C başarıyla oluşturuldu",
			data: z3c
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};

export const GET = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const search = request.nextUrl.searchParams.get("search");
		if (search) {
			if (search === "installed_z3cs") {
				const searchResults = await Z3Cs.find({
					_id: { $in: session.user.downloaded_z3cs }
				}).lean().exec();

				return Response.json({
					success: true,
					message: "OK",
					data: searchResults
				});
			} else {
				const searchResults = await Z3Cs.find({
					$or: [
						{ name: { $regex: decodeURIComponent(search), $options: "i" } },
						{ description: { $regex: decodeURIComponent(search), $options: "i" } },
						{ instructions: { $regex: decodeURIComponent(search), $options: "i" } }
					]
				}).populate("author", "_id username image").lean().exec();

				return Response.json({
					success: true,
					message: "OK",
					data: searchResults
				});
			}
		} else {
			const MAX_Z3CS_PER_CATEGORY = 9;
			const categoriesWithZ3Cs = (await Promise.all(categories.map(async (category) => {
				const z3cs = await Z3Cs.find({ category: category }).sort({ createdAt: -1 }).limit(MAX_Z3CS_PER_CATEGORY).populate("author", "_id username image").lean().exec();
				return z3cs;
			})));


			const [
				mostLikedAllTimes,
				mostDownloadedAllTimes,
				mostUsedAllTimes,
				totalZ3Cs
			] = (await Promise.all([
				await Z3Cs.find({}).sort({ likes: -1 }).limit(MAX_Z3CS_PER_CATEGORY).populate("author", "_id username image").lean().exec(),
				await Z3Cs.find({}).sort({ downloads: -1 }).limit(MAX_Z3CS_PER_CATEGORY).populate("author", "_id username image").lean().exec(),
				await Z3Cs.find({}).sort({ conversations: -1 }).limit(MAX_Z3CS_PER_CATEGORY).populate("author", "_id username image").lean().exec(),
				await Z3Cs.countDocuments()
			]));


			return Response.json({
				success: true,
				message: "OK",
				data: {
					categories: categoriesWithZ3Cs.flat().reduce((acc: any, curr: any) => {
						if (!acc.find((c: any) => c.id === curr.category)) {
							acc.push({
								id: curr.category,
								z3cs: []
							});
						}
						acc.find((c: any) => c.id === curr.category).z3cs.push(curr);
						return acc;
					}, []),
					mostLikedAllTimes,
					mostDownloadedAllTimes,
					mostUsedAllTimes,
					totalZ3Cs
				}
			});
		}
	}, {
		forceAuth: false,
		headers: request.headers
	});
};
import { AgentModel } from "@/database/models/Models";
import { AgentModel as TAgentModel } from "@/lib/definitions";
import { withAuth } from "@/middleware/withAuth";
import { ObjectId } from "mongoose";
import { type NextRequest } from 'next/server';
import { categories } from "@/constants/categories";
import { Z3Cs } from "@/database/models/Z3Cs";
import { userRaw } from "@/database/models/UserRaw";
import { auth } from "@/lib/auth";


export const POST = async (
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
		const isLiked = session?.user?.liked_z3cs.find((m: any) => m.equals(z3c._id));

		if (!isLiked) {
			await Z3Cs.updateOne({
				// @ts-ignore
				_id: z3c._id
			}, {
				$inc: {
					likes: 1
				}
			});
			await userRaw.updateOne({
				_id: session?.user?.id
			}, {
				$push: {
					// @ts-ignore
					liked_z3cs: z3c._id
				}
			});
		} else {
			await Z3Cs.updateOne({
				// @ts-ignore
				_id: z3c._id
			}, {
				$inc: {
					likes: -1
				}
			});

			await userRaw.updateOne({
				_id: session?.user?.id
			}, {
				$pull: {
					// @ts-ignore
					liked_z3cs: z3c._id
				}
			});
		}

		return Response.json({
			success: true,
			message: "OK",
			data: {
				is_liked: !isLiked
			}
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};
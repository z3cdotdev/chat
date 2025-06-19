import { AgentModel } from "@/database/models/Models";

export const GET = async () => {
    const models = await AgentModel.find({}).lean().exec();

    return Response.json({
        success: true,
        message: "OK",
        data: models
    });
};
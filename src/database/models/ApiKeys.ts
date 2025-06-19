import { Schema, model, models, Types } from "mongoose";

const ApiKeysSchema = new Schema({
	user: { type: Types.ObjectId, required: true },
    provider: { type: String, required: true },
    key: { type: String, required: true },
}, {
	timestamps: true,
	versionKey: false
});

export const ApiKeys = models.ApiKeys || model("ApiKeys", ApiKeysSchema);

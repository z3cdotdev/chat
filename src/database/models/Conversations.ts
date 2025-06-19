import { Schema, Types, model, models } from "mongoose";

const conversationSchema = new Schema({
	shared: {
		type: new Schema({
			enabled: { type: Boolean, default: false },
			lastMessageId: { type: Types.ObjectId, ref: "Message", default: null }
		}),
		default: { enabled: false, lastMessageId: null }
	},
	messages: [{
		type: Types.ObjectId,
		ref: "Message"
	}],
	title: { type: String, default: "New Conversation" },
	userId: { type: String, required: true },
	originalPrompt: { type: String, default: "" },
	fromAnonymousAccount: { type: Boolean, default: false },
	forkedFrom: {
		type: Types.ObjectId,
		ref: "Conversation",
		default: null,
		required: false
	},
	votes: {
		ups: { type: Array, default: [] },
		downs: { type: Array, default: [] }
	},
	z3cs: {
		type: [Types.ObjectId],
		ref: "Z3Cs",
		default: []
	}
}, {
	timestamps: true,
	versionKey: false
});

export const Conversation = models.Conversation || model("Conversation", conversationSchema);
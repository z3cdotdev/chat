import { Schema, Types, model, models } from "mongoose";
import { MessageDocument } from '@/lib/definitions';

const messageSchema = new Schema({
	chatId: {
		type: Types.ObjectId,
		ref: "Conversation",
		required: true
	},
	role: { type: String, required: true },
	parts: {
		type: Array,
		default: []
	},
	agentId: { type: String, required: false },
	agentOptions: { type: Object, default: {} },
	experimental_attachments: { type: Array, default: [] },
	resume: { type: Boolean, default: false }
}, {
	timestamps: true,
	versionKey: false
});

export const Message = models.Message || model<MessageDocument>("Message", messageSchema);
export type { MessageDocument };
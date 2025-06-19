import mongoose, { models } from 'mongoose';

const FeaturesSchema = new mongoose.Schema({
	vision: { type: Boolean, default: false },
	imageGeneration: { type: Boolean, default: false },
	objectGeneration: { type: Boolean, default: false },
	reasoning: { type: Boolean, default: false },
	pdfSupport: { type: Boolean, default: false },
	search: { type: Boolean, default: false },
	fast: { type: Boolean, default: false },
	experimental: { type: Boolean, default: false }
}, { _id: false });

const AgentModelSchema = new mongoose.Schema({
	provider: { type: String, required: true },
	openRouterId: { type: String, default: null },
	id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: { type: String, required: true },
	version: { type: String, default: null },
	features: { type: FeaturesSchema, default: () => ({}) },
	enabled: { type: Boolean, required: true },
	available: { type: Boolean, required: true },
	is_fallback: { type: Boolean, default: false },
	premium: { type: Boolean, default: false },
	api_key_required: { type: Boolean, default: false },
}, {
	versionKey: false,
	timestamps: true
});

export const AgentModel = models.AgentModel || mongoose.model('AgentModel', AgentModelSchema);
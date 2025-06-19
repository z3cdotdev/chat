import { Schema, model, models } from 'mongoose';
import { userRaw } from './UserRaw';
import { categories } from '@/constants/categories';

const Z3CsSchema = new Schema({
	profile_image: { type: String, default: '' },
	name: { type: String, required: true, trim: true },
	description: { type: String, default: '', trim: true },
	instructions: { type: String, required: true, trim: true },
	author: { type: Schema.Types.ObjectId, required: true, ref: userRaw },

	// Basit kategori - artık opsiyonel
	category: {
		type: String,
		default: null
	},

	// Basit istatistikler
	conversations: { type: Number, default: 0 },
	likes: { type: Number, default: 0 },
	downloads: { type: Number, default: 0 },

	// Durum
	is_active: { type: Boolean, default: true }
}, {
	timestamps: true,
	versionKey: false
});

// Basit arama indeksi
Z3CsSchema.index({ name: 'text', description: 'text' });

// Basit metodlar
Z3CsSchema.statics.findByCategory = function (category: string) {
	return this.find({ category, is_active: true }).sort({ conversations: -1 });
};

Z3CsSchema.statics.findActive = function () {
	return this.find({ is_active: true }).sort({ createdAt: -1 });
};

export const Z3Cs = models.Z3Cs || model('Z3Cs', Z3CsSchema);
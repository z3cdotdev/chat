import { model, Schema, models } from "mongoose";

export const userRaw = models.UserRaw || model('UserRaw', new Schema({}, { strict: false }), 'user');
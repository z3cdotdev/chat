import mongoose, { connection } from "mongoose";

export async function register() {
	const URL = process.env.DATABASE_URL!;
	if (!URL) {
		throw new Error("DATABASE_URL is not defined in the environment variables");
	}

	try {
		await mongoose.connect(URL);
	} catch (error) {
		console.error('Database connection error:', error);
		throw new Error('Database connection failed');
	}
}
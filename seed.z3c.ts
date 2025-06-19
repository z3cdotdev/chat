// Seed Z3C Chat
// import mongoose from "mongoose";
// import { categories } from "./src/constants/categories";
// import { Z3Cs } from "@/database/models/Z3Cs";
// import { put } from "@/lib/blob";
// import { createAvatar } from "@dicebear/core";
// import { glass } from "@dicebear/collection";
// import fs from "fs";
// import avatars from "./avatars.json";

// const seedZ3Cs = async () => {
// 	console.log("🌱 Seeding 100 unique Z3C personas...");

// 	const names = [
// 		"The Greeter", "MorningBot", "Motivator", "Night Watcher", "Yes-Can", "Word Wizard", "Mystery Answerer",
// 		"Retro Lover", "Time Traveler", "AI Confidant"
// 	];

// 	const descriptions = [
// 		"Always starts with a greeting",
// 		"Sends cheerful morning wishes",
// 		"Sparks your day with positivity",
// 		"Chats with you through the night",
// 		"Agrees with everything you say",
// 		"Plays with words and puns",
// 		"Loves stories from the past",
// 		"Predicts the future in strange ways",
// 		"Listens and responds thoughtfully",
// 		"Talks about time and its wonders"
// 	];

// 	const instructions = [
// 		"Begin every message with a warm greeting",
// 		"Include the word 'good morning' in every reply",
// 		"End each message with a positive note",
// 		"Only reply between 10PM and 6AM",
// 		"Always respond with 'sure!' no matter what",
// 		"Add a wordplay or pun in every message",
// 		"Write everything in past tense",
// 		"End each response with a random year (e.g. 1998)",
// 		"Finish every reply by saying 'understood'",
// 		"Always mention the current time in replies"
// 	];

// 	const categories = [
// 		"daily", "fun", "motivational", "time", "friendly", "creative"
// 	];

// 	function getRandomElement<T>(array: T[]): T {
// 		return array[Math.floor(Math.random() * array.length)];
// 	}

// 	function generateZ3C() {
// 		return {
// 			name: getRandomElement(names),
// 			description: getRandomElement(descriptions),
// 			instructions: getRandomElement(instructions),
// 			category: getRandomElement(categories),
// 			profile_image: getRandomElement(avatars.map((avatar: any) => avatar.avatar)),
// 			author: "68534b3ad673cfc8f35a2c01"
// 		};
// 	}

// 	const z3cs = Array.from({ length: 100 }, generateZ3C);

// 	await Z3Cs.insertMany(z3cs);
// 	console.log("✅ Done! All Z3C personas are now ready to chat.");
// };


// (async () => {
// 	console.log("🚀 Connecting to the database...");
// 	await mongoose.connect(process.env.DATABASE_URL!);
// 	await seedZ3Cs();
// })();

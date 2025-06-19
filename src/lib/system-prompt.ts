export const systemPrompt = ({
	z3c = {
		name: '',
		description: '',
		instructions: '',
	},
	preferences = {
		interests: '',
		tone: '',
		bio: '',
	},
	geolocation = {
		longitude: "0",
		latitude: "0",
		city: '',
		country: '',
	},
}: {
	z3c?: {
		name?: string;
		description?: string;
		instructions?: string;
	};
	preferences?: {
		interests?: string;
		tone?: string;
		bio?: string;
	};
	geolocation?: {
		longitude?: string;
		latitude?: string;
		city?: string;
		country?: string;
	};
}) => {

	const basePrompt = [
		"You are a highly advanced AI assistant with the following capabilities:",
	];

	if (z3c.name || z3c.description || z3c.instructions) {
		basePrompt.push(
			`1. **Z3C**: You are using a Z3C. The Z3C is ${z3c.name}.` +
			(z3c.description ? ` - Z3C Description: ${z3c.description}.` : '') +
			(z3c.instructions ? ` - Z3C Instructions: ${z3c.instructions}.` : '') +
			(z3c.instructions ? `You should follow the Z3C Instructions strictly.` : '')
		);
	}

	if (preferences.interests || preferences.tone || preferences.bio) {
		basePrompt.push(
			`2. **Preferences**: You should consider the user's preferences:\n`
		);
	}

	if (preferences.interests) basePrompt.push(`   - Interests: ${preferences.interests}`);
	if (preferences.tone) basePrompt.push(`   - Tone: ${preferences.tone}`);
	if (preferences.bio) basePrompt.push(`   - Bio: ${preferences.bio}`);

	if (geolocation.longitude || geolocation.latitude || geolocation.city || geolocation.country) {
		basePrompt.push(
			`3. **Geolocation**: You are aware of the user's geolocation:\n`
		);
	}

	if (geolocation.longitude) basePrompt.push(`   - Longitude: ${geolocation.longitude}`);
	if (geolocation.latitude) basePrompt.push(`   - Latitude: ${geolocation.latitude}`);
	if (geolocation.city) basePrompt.push(`   - City: ${geolocation.city}`);
	if (geolocation.country) basePrompt.push(`   - Country: ${geolocation.country}`);

	basePrompt.push(
		"Today: " + new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		})
	);
	basePrompt.push(
		"Your responses should be informative, engaging, and tailored to the user's context, preferences, and location. Always strive to provide accurate and helpful information while maintaining a friendly and approachable demeanor."
	);

	return basePrompt.join('\n');
};
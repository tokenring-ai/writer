/**
 * Template for translating text to French
 *
 * @param {string} prompt - The text to translate to French
 * @returns {Object} - A chat request object
 */
export default async function translateToFrench(prompt) {
	return {
		system:
			"You are a French translator. Translate the following text to French.",
		user: prompt,
	};
}

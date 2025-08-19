import fs from "node:fs";
/* eslint-disable turbo/no-undeclared-env-vars */
import path from "node:path";

const templateDirectory = path.join(import.meta.dirname, "../templates");
const templateFiles = fs.readdirSync(templateDirectory);

/** @type {Record<string, any>} */
const templates = {};
for (const file of templateFiles) {
	const template = await import(path.join(templateDirectory, file));
	templates[file.replace(".js", "")] = template.default;
}

export default {
	defaults: {
		persona: "writer",
	},
	ghost: {
		adminApiKey: process.env.GHOST_ADMIN_API_KEY,
		contentApiKey: process.env.GHOST_CONTENT_API_KEY,
		url: process.env.GHOST_URL,
	},
	models: {
		google: {
			displayName: "Google",
			apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		},
		openai: {
			displayName: "OpenAI",
			apiKey: process.env.OPENAI_API_KEY,
		},
		perplexity: {
			displayName: "Perplexity",
			apiKey: process.env.PERPLEXITY_API_KEY,
		},
		xai: {
			displayName: "xAi",
			apiKey: process.env.XAI_API_KEY,
		},
	},
	templates,
};

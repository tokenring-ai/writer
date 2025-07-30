import fs from "fs";
/* eslint-disable turbo/no-undeclared-env-vars */
import path from "path";

const templateDirectory = path.join(import.meta.dirname, "../templates");
const templateFiles = fs.readdirSync(templateDirectory);

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
		Google: {
			apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
			provider: "google",
		},
		OpenAI: {
			apiKey: process.env.OPENAI_API_KEY,
			provider: "openai",
		},
		Perplexity: {
			apiKey: process.env.PERPLEXITY_API_KEY,
			provider: "perplexity",
		},
		xAi: {
			apiKey: process.env.XAI_API_KEY,
			provider: "xai",
		},
	},
	templates,
};

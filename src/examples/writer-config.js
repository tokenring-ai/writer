/**
 * Default configuration for TokenRing Writer
 * @type {Object} JSON-like configuration
 * @description Provides default settings for content creation and management
 */

export default {
	defaults: {
		agent: "writer",
		model: "gpt-4o",
	},
	agents: {},
	models: {
		anthropic: {
			displayName: "Anthropic",
			apiKey: process.env.ANTHROPIC_API_KEY,
		},
		cerebras: {
			displayName: "Cerebras",
			apiKey: process.env.CEREBRAS_API_KEY,
		},
		deepseek: {
			displayName: "DeepSeek",
			apiKey: process.env.DEEPSEEK_API_KEY,
		},
		google: {
			displayName: "Google",
			apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		},
		groq: {
			displayName: "Groq",
			apiKey: process.env.GROQ_API_KEY,
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
	filesystem: {
		providers: {
			local: {
				type: "local",
			},
		},
	},
	websearch: {
		serper: {
			type: "serper",
			apiKey: process.env.SERPER_API_KEY,
		},
	},
	research: {},
	wikipedia: {},
};

/**
 * Default configuration for TokenRing Writer
 * @type {Object} JSON-like configuration
 * @description Provides default settings for content creation and management
 */

export default {
	websearch: {
		providers: {
			serper: {
				type: "serper",
				apiKey: process.env.SERPER_API_KEY,
			},
		},
	},
	filesystem: {
		defaultProvider: "local",
		providers: {
			local: {
				type: "local",
			},
		},
	},
	wikipedia: {
		baseUrl: "https://en.wikipedia.org",
	},
	research: {
		researchModel: "Google:gemini-2.5-flash",
	},
	ai: {
		defaultModel: "Google:gemini-2.5-flash",
		models: {
			Anthropic: {
				provider: "anthropic",
				apiKey: process.env.ANTHROPIC_API_KEY,
			},
			Cerebras: {
				provider: "cerebras",
				apiKey: process.env.CEREBRAS_API_KEY,
			},
			DeepSeek: {
				provider: "deepseek",
				apiKey: process.env.DEEPSEEK_API_KEY,
			},
			Google: {
				provider: "google",
				apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
			},
			Groq: {
				provider: "groq",
				apiKey: process.env.GROQ_API_KEY,
			},
			OpenAI: {
				provider: "openai",
				apiKey: process.env.OPENAI_API_KEY,
			},
			Perplexity: {
				provider: "perplexity",
				apiKey: process.env.PERPLEXITY_API_KEY,
			},
			xAi: {
				provider: "xai",
				apiKey: process.env.XAI_API_KEY,
			},
		},
	},
};

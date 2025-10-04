import fs from "fs";
import path from "path";

const templateDirectory = path.join(import.meta.dirname, "../templates");
const templateFiles = fs.readdirSync(templateDirectory);

const templates = {};
for (const file of templateFiles) {
 if (!file.endsWith(".js")) continue;
 const template = await import(path.join(templateDirectory, file));
 templates[file.replace(".js", "")] = template.default;
}

export default {
 websearch: {
  defaultProvider: "serper",
  providers: {
   serper: {
    type: 'serper',
    apiKey: process.env.SERPER_API_KEY,
   },
   scraperapi: {
    type: 'scraperapi',
    apiKey: process.env.SCRAPERAPI_API_KEY,
   },
  }
 },
 filesystem: {
  defaultProvider: "local",
  providers: {
   local: {
    type: "local",
    baseDirectory: path.resolve(import.meta.dirname,"../")
   }
  }
 },
 /*blog: {
  ghost: {
   type: 'ghost',
   adminApiKey: process.env.GHOST_ADMIN_API_KEY,
   contentApiKey: process.env.GHOST_CONTENT_API_KEY,
   url: process.env.GHOST_URL,
  },
 },*/
 wikipedia: {
  baseUrl: "https://en.wikipedia.org"
 },
 /*newsrpm: {
  apiKey: process.env.NEWSRPM_API_KEY,
 },
 cloudquote: {
  apiKey: process.env.CLOUDQUOTE_API_KEY,
 },*/
 research: {
  researchModel: "gemini-2.5-flash",
 },
 ai: {
  defaultModel: "Google:gemini-2.5-flash",
  models: {
   Google: {
    provider: "google",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
   },
   OpenAI: {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
   },
   xAi: {
    provider: "xai",
    apiKey: process.env.XAI_API_KEY,
   },
  },
 },
 /*cdn: {
  ghost: {
   type: 'ghost',
   adminApiKey: process.env.GHOST_ADMIN_API_KEY,
   url: process.env.GHOST_URL,
  },

  s3: {
   type: 's3',
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   region: process.env.AWS_REGION,
  }
 },*/
 templates,
};

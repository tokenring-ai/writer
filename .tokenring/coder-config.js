/* eslint-disable turbo/no-undeclared-env-vars */
import fs from 'fs';
import path from 'path';

function getSubdirectories(srcPath) {
  if (!fs.existsSync(srcPath)) return [];
  return fs.readdirSync(srcPath)
    .filter(f => fs.statSync(path.join(srcPath, f)).isDirectory())
    .map(f => f);
}

function makeFileTreeEntry(pkgRoot, dir, resources ) {
 const name = `fileTree/${pkgRoot}/${dir}`;
 resources[name] = {
  type: "fileTree",
  description: `${pkgRoot}/${dir} File Tree`,
  items: [
   {path: `./${pkgRoot}/${dir}`, include: /\.(prisma|graphql|txt|js|jsx|md|json)$/}
  ]
 };
}

function makeRepoMapEntry(pkgRoot, dir, resources ) {
 const name = `repoMap/${pkgRoot}/${dir}`;
 resources[name] = {
  type: "repoMap",
  description: `${pkgRoot}/${dir} Repo Map`,
  items: [
   {path: `./${pkgRoot}/${dir}`, include: /\.(prisma|graphql|txt|js|jsx|md|json)$/}
  ]
 };
}
function makeWholeFileEntry(pkgRoot, dir, resources ) {
  const name = `wholeFile/${pkgRoot}/${dir}`;
  resources[name] = {
   type: "wholeFile",
   description: `${pkgRoot}/${dir} Source Files`,
   items: [
    {path: `./${pkgRoot}/${dir}`, include: /\.(primsa|graphql|txt|js|jsx|md|json)$/}
   ]
  };
}

function makeTestingEntry(pkgRoot, dir, resources) {
 const packageFile = path.join(pkgRoot, dir, 'package.json');
 try {
  const tests = {};
  if (!fs.existsSync(packageFile)) return null;

  const packageJson = JSON.parse(fs.readFileSync(packageFile));

  const scripts = packageJson.scripts;
  if (scripts?.test) {
   tests.packageTests = {
    description: "Run package tests",
    command: "npm run test",
    workingDirectory: path.join(pkgRoot, dir)
   };
  }
  if (scripts?.eslint) {
   tests.eslint = {
    description: "Verify & fix formatting and lint rules",
    command: "npm run eslint",
    workingDirectory: path.join(pkgRoot, dir)
   };
  }

  if (Object.keys(tests).length === 0) return null;
  const name = `testing/${pkgRoot}/${dir}`;
  resources[name] = {
   type: "testing",
   description: `${pkgRoot}/${dir} Testing Context`,
   tests: tests,
  };
 } catch (error) {
  console.error(`Error while reading ${packageFile}`,error);
  return null;
 }
}

const packageRoots = [
  'pkg',
];
let dynamicResources = {};
for (const pkgRoot of packageRoots) {
  const dirs = getSubdirectories(pkgRoot);
  for (const dir of dirs) {
    makeFileTreeEntry(pkgRoot, dir, dynamicResources);
    makeRepoMapEntry(pkgRoot, dir, dynamicResources);
    makeWholeFileEntry(pkgRoot, dir, dynamicResources);
    makeTestingEntry(pkgRoot, dir, dynamicResources);
  }
}
export default {
 defaults: {
  model: "gpt-4.1-nano",
  resources: [
   'fileTree/*',
   'testing:*'
  ],
  selectedFiles: [
   ".tokenring/guidelines.txt"
  ],
  persona: 'deep-rag'
 },
 models: {
  Anthropic: {
   apiKey: process.env.ANTHROPIC_API_KEY,
   provider: 'anthropic',
  },
  Cerebras: {
   apiKey: process.env.CEREBRAS_API_KEY,
   provider: 'cerebras',
  },
  DeepSeek: {
   apiKey: process.env.DEEPSEEK_API_KEY,
   provider: 'deepseek',
  },
  Google: {
   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
   provider: 'google',
  },
  Groq: {
   apiKey: process.env.GROQ_API_KEY,
   provider: 'groq',
  },
  llama: {
   apiKey: process.env.LLAMA_API_KEY,
   provider: 'llama',
  },
  OpenAI: {
   apiKey: process.env.OPENAI_API_KEY,
   provider: 'openai',
  },
  RunPod: {
   baseURL: 'https://sfsasfasfs-8000.proxy.runpod.net/v1',
   apiKey: 'sk-ABCD1234567890',
   provider: 'vllm',
   generateModelSpec ( modelInfo ) {
    let {id: model} = modelInfo;
    model = model.replace(/:latest$/, '');
    model = model.replace(/^hf.co\/([^\/]*)\//, '');
    let type = 'chat';
    let capabilities = {};
    if (model.match(/embed/i)) {
     type = 'embedding';
     capabilities.alwaysHot = 1;
    } else if (model.match(/qwen[23]/i)) {
     Object.assign(capabilities, {
      reasoning: 2,
      tools: 2,
      intelligence: 2,
      speed: 2,
      contextLength: 128000,
      costPerMillionInputTokens: 0,
      costPerMillionOutputTokens: 0,
     });
    }
    return {type, capabilities};
   }
  },
  OpenRouter: {
   apiKey: process.env.OPENROUTER_API_KEY,
   provider: 'openrouter',
   modelFilter: (model) => {
    if (! model.supported_parameters?.includes('tools')) {
     return false;
    } else if (/openai|anthropic|xai|perplexity|cerebras/.test(model.id)) {
     return false;
    }
    return true;
   }
  },
  Perplexity: {
   apiKey: process.env.PERPLEXITY_API_KEY,
   provider: 'perplexity',
  },
  Qwen: {
   apiKey: process.env.DASHSCOPE_API_KEY,
   provider: 'qwen',
  },
  xAi: {
   apiKey: process.env.XAI_API_KEY,
   provider: 'xai',
  },
  OllamaCloud: {
   baseURL: process.env.OLLAMA_CLOUD_URL,
   provider: 'ollama',
   generateModelSpec ( modelInfo ) {
    let {name, model, details} = modelInfo;
    name = name.replace(/:latest$/, '');
    name = name.replace(/^hf.co\/([^\/]*)\//, '');
    let type = 'chat';
    let capabilities = {};
    if (model.match(/embed/i)) {
     type = 'embedding';
     capabilities.alwaysHot = 1;
    } else if (model.match(/qwen[23]/i) || details?.family?.match?.(/qwen3/i)) {
     Object.assign(capabilities, {
      reasoning: 2,
      tools: 2,
      intelligence: 2,
      speed: 2,
      contextLength: 128000,
      costPerMillionInputTokens: 0,
      costPerMillionOutputTokens: 0,
     });
    }
    return {type, capabilities};
   }
  },
  OllamaLan: {
   baseURL: process.env.OLLAMA_LAN_URL,
   provider: 'ollama',
   generateModelSpec ( modelInfo ) {
    let {name, model, details} = modelInfo;
    name = name.replace(/:latest$/, '');
    name = name.replace(/^hf.co\/([^\/]*)\//, '');
    let type = 'chat';
    let capabilities = {};
    if (model.match(/embed/i)) {
     type = 'embedding';
     capabilities.alwaysHot = 1;
    } else if (model.match(/qwen[23]/i) || details?.family?.match?.(/qwen3/i)) {
     Object.assign(capabilities, {
      reasoning: 1,
      tools: 1,
      intelligence: 1,
      speed: 1,
      contextLength: 128000,
      costPerMillionInputTokens: 0,
      costPerMillionOutputTokens: 0,
     });
    }
    return {type, capabilities};
   }
  },
  OllamaLocal: {
   baseURL: process.env.OLLAMA_LOCAL_URL,
   provider: 'ollama',
   generateModelSpec(modelInfo) {
    let {name, model, details} = modelInfo;
    name = name.replace(/:latest$/, '');
    name = name.replace(/^hf.co\/([^\/]*)\//, '');
    let type = 'chat';
    let capabilities = {};
    if (model.match(/embed/i)) {
     type = 'embedding';
     capabilities.alwaysHot = 1;
    } else if (model.match(/qwen[23]/i) || details?.family?.match?.(/qwen3/i)) {
     Object.assign(capabilities, {
      tools: 1,
      contextLength: 16000,
      costPerMillionInputTokens: 0,
      costPerMillionOutputTokens: 0,
     });
    }
    return {type, capabilities};
   }
  }
 },
 indexedFiles: [
  {path: "./"},
 ],
 watchedFiles: [
  {path: "./", include: /.(js|md|jsx|sql|txt)$/}
 ],
 resources: {
  ...dynamicResources
 }
};

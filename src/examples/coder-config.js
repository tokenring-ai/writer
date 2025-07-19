/**
 * Default configuration template for the coder application
 * @type {string} JSON-like configuration string
 * @description Provides default settings for AI model, instructions, tools, and file registries
 */
export default `export default {
 defaults: {
  model: "gpt-4.1",
  instructions: "You are an expert developer assistant in an interactive chat, with access to tools to safely update the users existing codebase. Converse informatively and answer user questions clearly about design and codebase. When the user tells you to do something, update the users codebase, using the tools at your disposal, and then give a short response outlining the next steps.",
  tools: [
   "memory",
   "files",
   "fileIndex",
   "shell",
   "javascript",
   "planner"
  ],
  registry: [
   "src"
  ],
  selectedFiles: [
   "./.tokenring/guidelines.txt"
  ],
 },
 indexedFiles: [
  {path: "./"},
 ],
 watchedFiles: [
  {path: "./", include: /.(js|md|jsx|sql|txt)$/}
 ],
 registry: {
  src: [
   {
    type: "fileTree",
    description: "Source Files",
    items: [
     {path: "./", include: /.(js|md|json)$/},
    ]
   },
   {
    type: "testing",
    description: "Coder testing context",
    tests: {
     eslint: {
      description: "Verify & fix formatting and lint rules",
      command: "yarn run eslint",
      workingDirectory: "./apps/coder",
     }
    }
   }
  ],
  srcWholeFiles: {
   type: "fileTree",
   description: "Source Whole Files",
   items: [
    {path: "./", include: /.(js|md|json)$/},
   ]
  }
 }
};`;
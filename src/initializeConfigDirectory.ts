import fs from "node:fs";
import path from "node:path";

// We will write the TypeScript example file as a .mjs config for end-users
// by embedding its source text rather than importing the object.
import {fileURLToPath} from "node:url";
import {error, success} from "./prettyString.ts";

function readExampleConfigSource(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const sourcePath = path.join(__dirname, "examples", "writer-config.ts");
  try {
    return fs.readFileSync(sourcePath, "utf8");
  } catch (e) {
    // Fallback minimal example if reading fails
    return "export default { defaults: { model: 'kimi-k2-instruct', persona: 'code' } };\n";
  }
}

export function initializeConfigDirectory(configDir: string): string {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }
    if (!fs.statSync(configDir).isDirectory()) {
      console.error(error(`${configDir} is not a directory, aborting`));
      process.exit(1);
    }

    const configFile = path.join(configDir, "writer-config.mjs");
    const gitignoreFile = path.join(configDir, ".gitignore");

    const exampleConfigSource = readExampleConfigSource()
      // Ensure it is valid ESM JS for the user config
      .replace(/: string\[]/g, "")
      .replace(/as \w+(?: \| \w+)*/g, "");

    console.log(success(`Copying example config to ${configFile}`));
    fs.writeFileSync(configFile, exampleConfigSource);

    console.log(success(`Creating .gitignore file`));
    fs.writeFileSync(gitignoreFile, "# Ignore database files\n*.db\n*.sqlite");

    console.log(success(`Initialized: ${configFile}`));
    return configFile;
  } catch (err) {
    console.error(error(`Initialization failed: ${err}`));
    process.exit(1);
  }
}

#!/usr/bin/env bun
import AgentPackage, {AgentManager} from "@tokenring-ai/agent";
import TokenRingApp, {PluginManager} from "@tokenring-ai/app";
import AIClientPackage from "@tokenring-ai/ai-client";
import BlogPackage from "@tokenring-ai/blog";
import CDNPackage from "@tokenring-ai/cdn";
import ChatPackage from "@tokenring-ai/chat";
import CheckpointPackage from "@tokenring-ai/checkpoint";
import ChromePackage from "@tokenring-ai/chrome";
import CLIPackage, {REPLService} from "@tokenring-ai/cli";
import CloudQuotePackage from "@tokenring-ai/cloudquote";
import DrizzleStoragePackage from "@tokenring-ai/drizzle-storage";
import FeedbackPackage from "@tokenring-ai/feedback";
import FilesystemPackage from "@tokenring-ai/filesystem";
import GhostIOPackage from "@tokenring-ai/ghost-io";
import LocalFileSystemPackage from "@tokenring-ai/local-filesystem";
import MCPPackage from "@tokenring-ai/mcp";
import MemoryPackage from "@tokenring-ai/memory";
import QueuePackage from "@tokenring-ai/queue";
import RedditPackage from "@tokenring-ai/reddit";
import ResearchPackage from "@tokenring-ai/research";
import S3Package from "@tokenring-ai/s3";
import ScraperAPIPackage from "@tokenring-ai/scraperapi";
import ScriptingPackage from "@tokenring-ai/scripting";
import SerperPackage from "@tokenring-ai/serper";
import TasksPackage from "@tokenring-ai/tasks";
import TemplatePackage from "@tokenring-ai/template";
import WebSearchPackage from "@tokenring-ai/websearch";
import WikipediaPackage from "@tokenring-ai/wikipedia";
import WordPressPackage from "@tokenring-ai/wordpress";
import chalk from "chalk";
import {Command} from "commander";
import fs from "node:fs";
import path from "node:path";
import {z} from "zod";
import agents from "./agents.js";
import {initializeConfigDirectory} from "./initializeConfigDirectory.ts";
import {error} from "./prettyString.ts";

// Create a new Commander program
const program = new Command();

interface CommandOptions {
  source: string;
  config?: string;
  initialize?: boolean;
}

program
  .name("tr-writer")
  .description("TokenRing Writer - AI-powered writing assistant")
  .version("1.0.0")
  .requiredOption(
    "-s, --source <path>",
    "Path to the working directory to store the config and scratch files in",
  )
  .option("-c, --config <path>", "Path to the configuration file")
  .option(
    "-i, --initialize",
    "Initialize the source directory with a new config directory",
  )
  .addHelpText(
    "after",
    `
Examples:
  tr-writer --source ./my-app
  tr-writer --source ./my-app --initialize
  tr-writer --source ./my-app --config ./custom-config.ts
`,
  )
  .action(async (options: CommandOptions) => {
    try {
      await runWriter(options);
    } catch (err) {
      console.error(error(`Caught Error:`), err);
      process.exit(1);
    }
  });

program.parse();

async function runWriter({source, config: configFile, initialize}: CommandOptions): Promise<void> {
  // noinspection JSCheckFunctionSignatures
  const resolvedSource = path.resolve(source);

  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Source directory not found: ${resolvedSource}`);
  }

  const configDirectory = path.join(resolvedSource, "/.tokenring");

  if (!configFile) {
    // Try each extension in order
    const possibleExtensions = ["mjs", "cjs", "js"];
    for (const ext of possibleExtensions) {
      const potentialConfig = path.join(configDirectory, `writer-config.${ext}`);
      if (fs.existsSync(potentialConfig)) {
        configFile = potentialConfig;
        break;
      }
    }
  }

  if (!configFile && initialize) {
    configFile = initializeConfigDirectory(configDirectory);
  }

  if (!configFile) {
    throw new Error(
      `Source directory ${resolvedSource} does not contain a .tokenring/writer-config.{mjs,cjs,js} file.\n` +
      `You can create one by adding --initialize:\n` +
      `./tr-writer --source ${resolvedSource} --initialize`,
    );
  }


  const configImport = await import(configFile);
  const config = z.record(z.string(), z.any()).parse(configImport.default)

  const baseDirectory = resolvedSource;

  config.filesystem ??= {
    defaultProvider: "local",
    providers: {
      local: {
        type: "local",
        baseDirectory,
      }
    }
  }

  config.checkpoint ??= {
    defaultProvider: "sqlite",
    providers: {
      sqlite: {
        type: "sqlite",
        databasePath: path.resolve(configDirectory, "./writer-database.sqlite"),
      }
    }
  };

  const app = new TokenRingApp(config);

  const pluginManager = new PluginManager();
  app.addServices(pluginManager);

  await pluginManager.installPlugins([
    AgentPackage,
    BlogPackage,
    CDNPackage,
    AIClientPackage,
    ChatPackage,
    CheckpointPackage,
    ChromePackage,
    CLIPackage,
    CloudQuotePackage,
    DrizzleStoragePackage,
    FeedbackPackage,
    FilesystemPackage,
    GhostIOPackage,
    LocalFileSystemPackage,
    MCPPackage,
    MemoryPackage,
    QueuePackage,
    RedditPackage,
    ResearchPackage,
    ScriptingPackage,
    S3Package,
    ScraperAPIPackage,
    SerperPackage,
    TasksPackage,
    TemplatePackage,
    WebSearchPackage,
    WikipediaPackage,
    WordPressPackage
  ], app);


  const agentManager = app.requireService(AgentManager);

  agentManager.addAgentConfigs(agents);

  console.log(chalk.yellow(banner));

  for (const name in config.agents) {
    agentManager.addAgentConfig(name, config.agents[name])
  }

  console.log(chalk.yellow(banner));

  const repl = new REPLService(app);

  await repl.run();
}

const banner = `
████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██████╗ ██╗███╗   ██╗ ██████╗ 
╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██╔══██╗██║████╗  ██║██╔════╝ 
   ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║██████╔╝██║██╔██╗ ██║██║  ███╗
   ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██╔══██╗██║██║╚██╗██║██║   ██║
   ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║██║  ██║██║██║ ╚████║╚██████╔╝
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
                                                                          
██╗    ██╗██████╗ ██╗████████╗███████╗██████╗                             
██║    ██║██╔══██╗██║╚══██╔══╝██╔════╝██╔══██╗                            
██║ █╗ ██║██████╔╝██║   ██║   █████╗  ██████╔╝                            
██║███╗██║██╔══██╗██║   ██║   ██╔══╝  ██╔══██╗                            
╚███╔███╔╝██║  ██║██║   ██║   ███████╗██║  ██║                            
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝                            
`;

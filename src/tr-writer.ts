#!/usr/bin/env node

import AgentPackage from "@tokenring-ai/agent";
import AIClientPackage from "@tokenring-ai/ai-client";
import TokenRingApp, {PluginManager} from "@tokenring-ai/app";
import {TokenRingAppConfigSchema} from "@tokenring-ai/app/TokenRingApp";
import BlogPackage from "@tokenring-ai/blog";
import CDNPackage from "@tokenring-ai/cdn";
import ChatPackage from "@tokenring-ai/chat";
import CheckpointPackage, {CheckpointPackageConfigSchema} from "@tokenring-ai/checkpoint";
import ChromePackage from "@tokenring-ai/chrome";
import CLIPackage, {CLIConfigSchema} from "@tokenring-ai/cli";
import InkCLIPackage, {InkCLIConfigSchema} from "@tokenring-ai/cli-ink";
import CloudQuotePackage from "@tokenring-ai/cloudquote";
import DrizzleStoragePackage from "@tokenring-ai/drizzle-storage";
import FeedbackPackage from "@tokenring-ai/feedback";
import FilesystemPackage, {FileSystemConfigSchema} from "@tokenring-ai/filesystem";
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
import formatLogMessages from "@tokenring-ai/utility/string/formatLogMessage";
import WebSearchPackage from "@tokenring-ai/websearch";
import WikipediaPackage from "@tokenring-ai/wikipedia";
import WordPressPackage from "@tokenring-ai/wordpress";
import chalk from "chalk";
import {Command} from "commander";
import fs from "node:fs";
import path from "node:path";
import {z} from "zod";
import packageInfo from '../package.json' with {type: 'json'};
import agents from "./agents/index.ts";
import bannerNarrow from "./banner.narrow.txt" with {type: "text"};
import bannerWide from "./banner.wide.txt" with {type: "text"};
import {initializeConfigDirectory} from "./initializeConfigDirectory.ts";

// Interface definitions
interface CommandOptions {
  source: string;
  config?: string;
  initialize?: boolean;
  ui: "ink" | "inquirer";
}

// Create a new Commander program
const program = new Command();

program
  .name("tr-writer")
  .description("TokenRing Writer - AI-powered writing assistant")
  .version(packageInfo.version)
  .option("--ui <inquirer|ink>", "Select the UI to use for the application", "inquirer")
  .option("-s, --source <path>", "Path to the working directory to work with")
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
`,
  )
  .action(runApp)
  .parse();

async function runApp({source, config: configFile, initialize, ui}: CommandOptions): Promise<void> {
  try {
  // noinspection JSCheckFunctionSignatures
  const resolvedSource = path.resolve(source);

  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Source directory not found: ${resolvedSource}`);
  }

  const configDirectory = path.join(resolvedSource, "/.tokenring");

  if (!configFile) {
    // Try each extension in order
    const possibleExtensions = ["ts", "mjs", "cjs", "js"];
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

  const baseDirectory = resolvedSource;

    const defaultConfig = {
      filesystem: {
        defaultProvider: "local",
        providers: {
          local: {
            type: "local",
            baseDirectory,
          }
        }
      } as z.input<typeof FileSystemConfigSchema>,
      checkpoint: {
        defaultProvider: "sqlite",
        providers: {
          sqlite: {
            type: "sqlite",
            databasePath: path.resolve(configDirectory, "./writer-database.sqlite"),
          }
        }
      } as z.input<typeof CheckpointPackageConfigSchema>,
      cli: {
        banner: bannerNarrow,
        bannerColor: "cyan"
      } as z.input<typeof CLIConfigSchema>,
      inkCLI: {
        bannerNarrow,
        bannerWide,
        bannerCompact: `🤖 TokenRing Writer ${packageInfo.version} - https://tokenring.ai`
      } as z.input<typeof InkCLIConfigSchema>,
      agents
  };

    const configImport = await import(configFile);
    const config = TokenRingAppConfigSchema.parse(configImport.default);

    config.agents = {...agents, ...config.agents};

    const app = new TokenRingApp(config, defaultConfig);

  const pluginManager = new PluginManager(app);

  await pluginManager.installPlugins([
    AgentPackage,
    BlogPackage,
    CDNPackage,
    AIClientPackage,
    ChatPackage,
    CheckpointPackage,
    ChromePackage,
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
  ]);

    if (ui === "ink") {
      await pluginManager.installPlugins([
        InkCLIPackage,
      ]);
    } else {
      await pluginManager.installPlugins([
        CLIPackage,
      ]);
    }

  } catch (err) {
    console.error(chalk.red(formatLogMessages(['Caught Error: ', err as Error])));
    process.exit(1);
  }
}
#!/usr/bin/env node

import AgentPlugin from "@tokenring-ai/agent/plugin";
import AIClientPlugin from "@tokenring-ai/ai-client/plugin";
import TokenRingApp, {PluginManager} from "@tokenring-ai/app";
import {TokenRingAppConfigSchema} from "@tokenring-ai/app/TokenRingApp";
import BlogPlugin from "@tokenring-ai/blog/plugin";
import CDNPlugin from "@tokenring-ai/cdn/plugin";
import ChatPlugin from "@tokenring-ai/chat/plugin";
import ChatFrontendPlugin from "@tokenring-ai/chat-frontend/plugin";
import CheckpointPlugin from "@tokenring-ai/checkpoint/plugin";
import {CheckpointPluginConfigSchema} from "@tokenring-ai/checkpoint";
import ChromePlugin from "@tokenring-ai/chrome/plugin";
import CLIPlugin from "@tokenring-ai/cli/plugin";
import {CLIConfigSchema} from "@tokenring-ai/cli";
import InkCLIPlugin from "@tokenring-ai/cli-ink/plugin";
import {InkCLIConfigSchema} from "@tokenring-ai/cli-ink";
import CloudQuotePlugin from "@tokenring-ai/cloudquote/plugin";
import DrizzleStoragePlugin from "@tokenring-ai/drizzle-storage/plugin";
import FeedbackPlugin from "@tokenring-ai/feedback/plugin";
import FilesystemPlugin from "@tokenring-ai/filesystem/plugin";
import {FileSystemConfigSchema} from "@tokenring-ai/filesystem";
import GhostIOPlugin from "@tokenring-ai/ghost-io/plugin";
import LocalFileSystemPlugin from "@tokenring-ai/local-filesystem/plugin";
import MCPPlugin from "@tokenring-ai/mcp/plugin";
import MemoryPlugin from "@tokenring-ai/memory/plugin";
import QueuePlugin from "@tokenring-ai/queue/plugin";
import RedditPlugin from "@tokenring-ai/reddit/plugin";
import ResearchPlugin from "@tokenring-ai/research/plugin";
import S3Plugin from "@tokenring-ai/s3/plugin";
import SchedulerPlugin from "@tokenring-ai/scheduler/plugin";
import ScraperAPIPlugin from "@tokenring-ai/scraperapi/plugin";
import ScriptingPlugin from "@tokenring-ai/scripting/plugin";
import SerperPlugin from "@tokenring-ai/serper/plugin";
import TasksPlugin from "@tokenring-ai/tasks/plugin";
import TemplatePlugin from "@tokenring-ai/template/plugin";
import ThinkingPlugin from "@tokenring-ai/thinking/plugin";
import VaultPlugin from "@tokenring-ai/vault/plugin";
import WebHostPlugin from "@tokenring-ai/web-host/plugin";
import {WebHostConfigSchema} from "@tokenring-ai/web-host";
import WebSearchPlugin from "@tokenring-ai/websearch/plugin";
import WikipediaPlugin from "@tokenring-ai/wikipedia/plugin";
import WordPressPlugin from "@tokenring-ai/wordpress/plugin";
import WorkflowPlugin from "@tokenring-ai/workflow/plugin";
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
import formatLogMessages from "@tokenring-ai/utility/string/formatLogMessage";

const plugins = [
  AgentPlugin,
  AIClientPlugin,
  BlogPlugin,
  CDNPlugin,
  ChatFrontendPlugin,
  ChatPlugin,
  CheckpointPlugin,
  ChromePlugin,
  CloudQuotePlugin,
  DrizzleStoragePlugin,
  FeedbackPlugin,
  FilesystemPlugin,
  GhostIOPlugin,
  LocalFileSystemPlugin,
  MCPPlugin,
  MemoryPlugin,
  QueuePlugin,
  RedditPlugin,
  ResearchPlugin,
  S3Plugin,
  SchedulerPlugin,
  ScraperAPIPlugin,
  ScriptingPlugin,
  SerperPlugin,
  TasksPlugin,
  TemplatePlugin,
  ThinkingPlugin,
  VaultPlugin,
  WebHostPlugin,
  WebSearchPlugin,
  WikipediaPlugin,
  WordPressPlugin,
  WorkflowPlugin,
];

// Interface definitions
interface CommandOptions {
  source: string;
  config?: string;
  initialize?: boolean;
  http?: string;
  httpPassword?: string;
  httpBearer?: string;
  ui: "ink" | "inquirer" | "none";
}

// Create a new Commander program
const program = new Command();

program
  .name("tr-writer")
  .description("TokenRing Writer - AI-powered writing assistant")
  .version(packageInfo.version)
  .option("--ui <inquirer|ink|none>", "Select the UI to use for the application", "inquirer")
  .option("-s, --source <path>", "Path to the working directory to work with (default: cwd)", ".")
  .option("--http [host:port]", "Starts an HTTP server for interacting with the application, by default listening on 127.0.0.1 and a random port, unless host and port are specified")
  .option("--httpPassword <user:password>", "Username and password for authentication with the webui (default: No auth required)")
  .option("--httpBearer <user:bearer>", "Username and bearer token for authentication with the webui (default: No auth required)")
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

async function runApp({source, config: configFile, initialize, ui, http, httpPassword, httpBearer}: CommandOptions): Promise<void> {
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
      console.error(
        `Source directory ${resolvedSource} does not contain a .tokenring/writer-config.{mjs,cjs,js} file.\n` +
        `You can create one by adding --initialize:\n` +
        `./tr-writer --source ${resolvedSource} --initialize`,
      );
      process.exit(1);
    }

    //console.log("Loading configuration from: ", configFile);

    const baseDirectory = resolvedSource;

    let auth: z.infer<typeof WebHostConfigSchema>["auth"] = undefined;
    if (httpPassword) {
      const [username, password] = httpPassword.split(":");
      ((auth ??= { users: {}}).users[username] ??= {}).password = password;
    }
    if (httpBearer) {
      const [username, bearerToken] = httpBearer.split(":");
      ((auth ??= { users: {}}).users[username] ??= {}).bearerToken = bearerToken;
    }

    const [listenHost, listenPortStr] = http?.split?.(":") ?? ['127.0.0.1', ''];
    let listenPort = listenPortStr ? parseInt(listenPortStr) : undefined;
    if (listenPort && isNaN(listenPort)) {
      console.error(`Invalid port number: ${listenPort}`);
      process.exit(1);
    }

    const defaultConfig = {
      filesystem: {
        defaultProvider: "local",
        providers: {
          local: {
            type: "local",
            baseDirectory,
          }
        }
      } satisfies z.input<typeof FileSystemConfigSchema>,
      checkpoint: {
        defaultProvider: "sqlite",
        providers: {
          sqlite: {
            type: "sqlite",
            databasePath: path.resolve(configDirectory, "./writer-database.sqlite"),
          }
        }
      } satisfies z.input<typeof CheckpointPluginConfigSchema>,
      ...(ui === 'inquirer' && {
        cli: {
          bannerNarrow,
          bannerWide,
          bannerCompact: `🤖 TokenRing Coder ${packageInfo.version} - https://tokenring.ai`
        } satisfies z.input<typeof CLIConfigSchema>
      }),
      ...(ui === 'ink' && {
        inkCLI: {
          bannerNarrow,
          bannerWide,
          bannerCompact: `🤖 TokenRing Coder ${packageInfo.version} - https://tokenring.ai`
        } satisfies z.input<typeof InkCLIConfigSchema>
      }),
      ...(http && {
        webHost: {
          host: listenHost,
          ...(listenPort && {port: listenPort}),
          auth,
        } satisfies z.input<typeof WebHostConfigSchema>
      }),
      agents
    };

    const configImport = await import(configFile);
    const config = TokenRingAppConfigSchema.parse(configImport.default);

    config.agents = {...agents, ...(config.agents ?? {})};

    // TODO: Figure out a more elegant way to bundle SPA apps into a Single Executable
    let packageDirectory = path.resolve(import.meta.dirname, "../");
    if (packageDirectory.startsWith("/$bunfs")) {
      packageDirectory = path.resolve(process.execPath, "../");
    }

    const app = new TokenRingApp(packageDirectory, config, defaultConfig);

    const pluginManager = new PluginManager(app);

    await pluginManager.installPlugins(plugins)

    await app.run();
  } catch (err) {
    console.error(chalk.red(formatLogMessages(['Caught Error: ', err as Error])));
    process.exit(1);
  }
}
#!/usr/bin/env bun
import {AgentTeam, packageInfo as AgentPackage} from "@tokenring-ai/agent";
import {packageInfo as ChatRouterPackage} from "@tokenring-ai/ai-client";
import {packageInfo as BlogPackage} from "@tokenring-ai/blog";
import {packageInfo as CDNPackage} from "@tokenring-ai/cdn";
import {packageInfo as CheckpointPackage} from "@tokenring-ai/checkpoint";
import {packageInfo as ChromePackage} from "@tokenring-ai/chrome";
import {packageInfo as CLIPackage, REPLService} from "@tokenring-ai/cli";
import {packageInfo as CloudQuotePackage} from "@tokenring-ai/cloudquote";
import {packageInfo as FeedbackPackage} from "@tokenring-ai/feedback";
import {packageInfo as FilesystemPackage} from "@tokenring-ai/filesystem";
import {packageInfo as GhostIOPackage} from "@tokenring-ai/ghost-io";
import {packageInfo as IterablesPackage} from "@tokenring-ai/iterables";
import {packageInfo as LocalFileSystemPackage} from "@tokenring-ai/local-filesystem";
import {packageInfo as MCPPackage} from "@tokenring-ai/mcp";
import {packageInfo as MemoryPackage} from "@tokenring-ai/memory";
import {packageInfo as QueuePackage} from "@tokenring-ai/queue";
import {packageInfo as RedditPackage} from "@tokenring-ai/reddit";
import {packageInfo as ResearchPackage} from "@tokenring-ai/research";
import {packageInfo as S3Package} from "@tokenring-ai/s3";
import {packageInfo as ScraperAPIPackage} from "@tokenring-ai/scraperapi";
import {packageInfo as ScriptingPackage} from "@tokenring-ai/scripting";
import {packageInfo as SerperPackage} from "@tokenring-ai/serper";
import {packageInfo as SQLiteStoragePackage} from "@tokenring-ai/sqlite-storage";
import {packageInfo as TasksPackage} from "@tokenring-ai/tasks";
import {packageInfo as TemplatePackage} from "@tokenring-ai/template";
import {packageInfo as WebSearchPackage} from "@tokenring-ai/websearch";
import {packageInfo as WikipediaPackage} from "@tokenring-ai/wikipedia";
import {packageInfo as WordPressPackage} from "@tokenring-ai/wordpress";
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

  const agentTeam = new AgentTeam(config);
  agentTeam.events.on("serviceOutput", message => {
    console.log(chalk.yellow(`🔧 ${message}`));
  })
  agentTeam.events.on("serviceError", message => {
    console.log(chalk.red(`🔧 ❌ ${message}`));
  });

  await agentTeam.addPackages([
    AgentPackage,
    BlogPackage,
    CDNPackage,
    ChatRouterPackage,
    CheckpointPackage,
    ChromePackage,
    CLIPackage,
    CloudQuotePackage,
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
    SQLiteStoragePackage,
    TasksPackage,
    TemplatePackage,
    IterablesPackage,
    WebSearchPackage,
    WikipediaPackage,
    WordPressPackage
  ]);

  agentTeam.addAgentConfigs(
    agents
  )

  console.log(chalk.yellow(banner));

  const repl = new REPLService(agentTeam);

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

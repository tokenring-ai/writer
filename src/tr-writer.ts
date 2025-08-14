#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import * as ChatRouterPackage from "@token-ring/ai-client";
import ModelRegistry, {ModelConfig} from "@token-ring/ai-client/ModelRegistry";
import * as models from "@token-ring/ai-client/models";
import * as ChatPackage from "@token-ring/chat";
import { ChatService } from "@token-ring/chat";
import * as ChromePackage from "@token-ring/chrome";
import * as CLIPackage from "@token-ring/cli";
import { REPLService, ReplHumanInterfaceService } from "@token-ring/cli";
import * as FilesystemPackage from "@token-ring/filesystem";
import * as LocalFilesystemPackage from "@token-ring/local-filesystem";
import { LocalFileSystemService } from "@token-ring/local-filesystem";
import * as FeedbackPackage from "@token-ring/feedback";
import * as GhostPackage from "@token-ring/ghost-io";
import { GhostIOService } from "@token-ring/ghost-io";
import * as HistoryPackage from "@token-ring/history";
import * as MemoryPackage from "@token-ring/memory";
import { EphemeralMemoryService } from "@token-ring/memory";
import { WorkQueueService } from "@token-ring/queue";
import * as RegistryPackage from "@token-ring/registry";
import { Registry } from "@token-ring/registry";
import * as ResearchPackage from "@token-ring/research";
import * as SQLiteChatStoragePackage from "@token-ring/sqlite-storage";
import {
  SQLiteChatCheckpointStorage,
  SQLiteChatHistoryStorage,
  SQLiteChatMessageStorage,
  SQLiteCLIHistoryStorage,
} from "@token-ring/sqlite-storage";
import initializeLocalDatabase from "@token-ring/sqlite-storage/db/initializeLocalDatabase";
import * as TemplatePackage from "@token-ring/template";
import { TemplateRegistry } from "@token-ring/template";
import * as ScraperAPIPackage from "@token-ring/scraperapi";
import { ScraperAPIService } from "@token-ring/scraperapi";
import * as SerperPackage from "@token-ring/serper";
import { SerperService } from "@token-ring/serper";
import * as NewsRPMPackage from "@token-ring/newsrpm";
import { NewsRPMService } from "@token-ring/newsrpm";
import chalk from "chalk";
import { Command } from "commander";
import defaultPersonas from "./defaults/personas.ts";
import { initializeConfigDirectory } from "./initializeConfigDirectory.ts";
import { error } from "./prettyString.ts";
import {PersonaConfig} from "@token-ring/chat/ChatService";

interface WriterConfig {
    defaults: {
        persona: string;
        tools?: string[];
    };
    personas: Record<string, PersonaConfig>
    ghost?: {
        adminApiKey: string;
        contentApiKey: string;
        url: string;
    };
    scraperapi?: {
        apiKey: string;
        countryCode?: string;
        tld?: string;
        outputFormat?: 'json' | 'csv';
        render?: boolean;
        deviceType?: 'desktop' | 'mobile';
    };
    serper?: {
        apiKey: string;
        gl?: string;
        hl?: string;
        location?: string;
        num?: number;
        page?: number;
    };
    newsrpm?: {
        apiKey: string;
        authMode?: 'privateHeader' | 'publicHeader' | 'privateQuery' | 'publicQuery';
        baseUrl?: string;
        defaults?: { timeoutMs?: number };
        retry?: { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number; jitter?: boolean };
    };
    models: Record<string, ModelConfig>;
    templates: Record<string, any>;
}

// Create a new Commander program
const program = new Command();

type RunOptions = {
  source: string;
  config?: string;
  initialize?: boolean;
};

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
  .action(async (options: RunOptions) => {
    try {
      await runWriter(options);
    } catch (err) {
      console.error(error(`Caught Error:`), err);
      process.exit(1);
    }
  });

program.parse();

async function runWriter({ source, config: configFileInput, initialize }: RunOptions): Promise<void> {
  // noinspection JSCheckFunctionSignatures
  const resolvedSource = path.resolve(source);

  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Source directory not found: ${resolvedSource}`);
  }

  const configDirectory = path.join(resolvedSource, "/.tokenring");

  let configFile = configFileInput;
  if (!configFile) {
    // Try each extension in order
    const possibleExtensions = ["mjs", "cjs", "js"] as const;
    for (const ext of possibleExtensions) {
      const potentialConfig = path.join(
        configDirectory,
        `writer-config.${ext}`,
      );
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
  const config = configImport.default as WriterConfig;

  const registry = new Registry();
  await registry.start();

  await registry.addPackages(
    ChatPackage,
    ChatRouterPackage,
    ChromePackage,
    CLIPackage,
    FilesystemPackage,
    FeedbackPackage,
    GhostPackage,
    HistoryPackage,
    LocalFilesystemPackage,
    MemoryPackage,
    RegistryPackage,
    SQLiteChatStoragePackage,
    TemplatePackage,
    ResearchPackage,
    ScraperAPIPackage,
    SerperPackage,
    NewsRPMPackage,
  );

  const db = initializeLocalDatabase(
    path.resolve(configDirectory, "./writer-database.sqlite"),
  );

  const { defaults } = config;

  const defaultTools = Object.keys({
    ...MemoryPackage.tools,
    ...ResearchPackage.tools,
    ...TemplatePackage.tools,
    ...(config.ghost ? (GhostPackage).tools : {}),
    ...(config.scraperapi ? (ScraperAPIPackage).tools : {}),
    ...(config.newsrpm ? (NewsRPMPackage).tools : {}),
  });

  await registry.tools.enableTools(defaults?.tools ?? defaultTools);
  console.log(chalk.greenBright(banner));

  // Initialize the chat context with personas
  const chatService = new ChatService({
    personas: config.personas || defaultPersonas, // Use loaded config
    persona: config.defaults?.persona || "writer", // Use loaded config
  });

  const modelRegistry = new ModelRegistry();
  await modelRegistry.initializeModels(models as any, config.models);

  const templateRegistry = new TemplateRegistry();
  if (config.templates) {
    templateRegistry.loadTemplates(config.templates);
  }

  // Create CLI history storage with 200 command limit
  const cliHistoryStorage = new SQLiteCLIHistoryStorage({ 
    db, 
    config: { limit: 200 }
  });

  await registry.services.addServices(
    chatService,
    new REPLService({ historyStorage: cliHistoryStorage }),
    new ReplHumanInterfaceService(),
    new LocalFileSystemService({ rootDirectory: resolvedSource }),
    modelRegistry,
    templateRegistry,
    new SQLiteChatMessageStorage({ db }),
    new SQLiteChatHistoryStorage({ db }),
    new SQLiteChatCheckpointStorage({ db }),
    new WorkQueueService(),
    new EphemeralMemoryService(),
  );

  const ghostConfig = config.ghost;
  if (ghostConfig && ghostConfig.url && ghostConfig.adminApiKey && ghostConfig.contentApiKey) {
    await registry.services.addServices(new GhostIOService(ghostConfig));
  } else if (ghostConfig) {
    console.warn("Ghost configuration detected but incomplete. Skipping GhostIOService initialization. Required: url, adminApiKey, contentApiKey.");
  }

  const scraperConfig = config.scraperapi;
  if (scraperConfig && scraperConfig.apiKey) {
    await registry.services.addServices(new ScraperAPIService(scraperConfig));
  } else if (scraperConfig) {
    console.warn("ScraperAPI configuration detected but missing apiKey. Skipping ScraperAPIService initialization.");
  }

  const nrpmConfig = config.newsrpm;
  if (nrpmConfig && nrpmConfig.apiKey) {
    await registry.services.addServices(new NewsRPMService(nrpmConfig as any));
  } else if (nrpmConfig) {
    console.warn("NewsRPM configuration detected but missing apiKey. Skipping NewsRPMService initialization.");
  }
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

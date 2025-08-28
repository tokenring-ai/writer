#!/usr/bin/env bun
import * as ChatRouterPackage from "@token-ring/ai-client";
import ModelRegistry from "@token-ring/ai-client/ModelRegistry";
import * as models from "@token-ring/ai-client/models";
import * as BlogPackage from "@token-ring/blog";
import {BlogService} from "@token-ring/blog";
import {CDNService} from "@token-ring/cdn";
import * as CDNPackage from "@token-ring/cdn";
import * as ChatPackage from "@token-ring/chat";
import {ChatService} from "@token-ring/chat";
import {ChromeWebSearchResource} from "@token-ring/chrome";
import * as ChromePackage from "@token-ring/chrome";
import * as CLIPackage from "@token-ring/cli";
import * as CloudQuotePackage from "@token-ring/cloudquote";
import { CloudQuoteService} from "@token-ring/cloudquote";
import {ReplHumanInterfaceService, REPLService} from "@token-ring/cli";
import * as FeedbackPackage from "@token-ring/feedback";
import * as FilesystemPackage from "@token-ring/filesystem";
import {GhostBlogResource} from "@token-ring/ghost-io";
import * as GhostPackage from "@token-ring/ghost-io";
import GhostCDNResource from "@token-ring/ghost-io/GhostCDNResource";
import * as HistoryPackage from "@token-ring/history";
import * as LocalFilesystemPackage from "@token-ring/local-filesystem";
import {LocalFileSystemService} from "@token-ring/local-filesystem";
import * as MemoryPackage from "@token-ring/memory";
import {EphemeralMemoryService} from "@token-ring/memory";
import * as NewsRPMPackage from "@token-ring/newsrpm";
import {NewsRPMService} from "@token-ring/newsrpm";
import {WorkQueueService} from "@token-ring/queue";
import * as RegistryPackage from "@token-ring/registry";
import {Registry} from "@token-ring/registry";
import * as ResearchPackage from "@token-ring/research";
import ResearchService from "@token-ring/research/ResearchService";
import * as S3CDNPackage from "@token-ring/s3-cdn";
import {S3CDNResource} from "@token-ring/s3-cdn";
import * as ScraperAPIPackage from "@token-ring/scraperapi";
import {ScraperAPIWebSearchResource} from "@token-ring/scraperapi";
import * as SerperPackage from "@token-ring/serper";
import {SerperWebSearchResource} from "@token-ring/serper";
import * as SQLiteChatStoragePackage from "@token-ring/sqlite-storage";
import {
  SQLiteChatCheckpointStorage,
  SQLiteChatHistoryStorage,
  SQLiteChatMessageStorage,
  SQLiteCLIHistoryStorage
} from "@token-ring/sqlite-storage";
import initializeLocalDatabase from "@token-ring/sqlite-storage/db/initializeLocalDatabase";
import * as TemplatePackage from "@token-ring/template";
import {TemplateRegistry} from "@token-ring/template";
import {WebSearchService} from "@token-ring/websearch";
import * as WebSearchPackage from "@token-ring/websearch";
import {WordPressBlogResource, WordPressCDNResource} from "@token-ring/wordpress";
import chalk from "chalk";
import {Command} from "commander";
import fs from "node:fs";
import path from "node:path";
import * as WikipediaPackage from "@token-ring/wikipedia";
import {WikipediaService} from "@token-ring/wikipedia";
import {WriterConfig} from "./config.types.ts";
import defaultPersonas from "./defaults/personas.ts";
import {initializeConfigDirectory} from "./initializeConfigDirectory.ts";
import {error} from "./prettyString.ts";

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

async function runWriter({source, config: configFileInput, initialize}: RunOptions): Promise<void> {
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
    BlogPackage,
    CDNPackage,
    ChatPackage,
    ChatRouterPackage,
    ChromePackage,
    CLIPackage,
    CloudQuotePackage,
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
    S3CDNPackage,
    NewsRPMPackage,
    WebSearchPackage,
    WikipediaPackage,
  );

  const db = initializeLocalDatabase(
    path.resolve(configDirectory, "./writer-database.sqlite"),
  );

  const {defaults} = config;


  const defaultTools: string[] = [
    ...Object.values(ChromePackage.tools).map((tool) => tool.name),
    ...Object.values(ResearchPackage.tools).map((tool) => tool.name),
    ...Object.values(TemplatePackage.tools).map((tool) => tool.name),
    ...(config.blog ? Object.values(BlogPackage.tools).map(tool => tool.name) : []),
    ...(config.websearch ? Object.values(WebSearchPackage.tools).map(tool => tool.name) : []),
    ...(config.newsrpm ? Object.values(NewsRPMPackage.tools).map(tool => tool.name) : []),
    ...(config.cloudquote ? Object.values(CloudQuotePackage.tools).map(tool => tool.name) : []),
    ...Object.values(WikipediaPackage.tools).map(tool => tool.name),
  ];

  await registry.tools.enableTools(defaults?.tools ?? defaultTools);
  console.log(chalk.greenBright(banner));

  // Initialize the chat context with personas
  const chatService = new ChatService({
    personas: config.personas || defaultPersonas, // Use loaded config
    persona: config.defaults?.persona || "writer", // Use loaded config
  });

  const modelRegistry = new ModelRegistry();
  await modelRegistry.initializeModels(models, config.models);

  const templateRegistry = new TemplateRegistry();
  if (config.templates) {
    templateRegistry.loadTemplates(config.templates);
  }

  // Create CLI history storage with 200 command limits
  const cliHistoryStorage = new SQLiteCLIHistoryStorage({
    db,
    config: {limit: 200}
  });

  await registry.services.addServices(
    chatService,
    new REPLService({historyStorage: cliHistoryStorage}),
    new ReplHumanInterfaceService(),
    new LocalFileSystemService({rootDirectory: resolvedSource}),
    modelRegistry,
    templateRegistry,
    new SQLiteChatMessageStorage({db}),
    new SQLiteChatHistoryStorage({db}),
    new SQLiteChatCheckpointStorage({db}),
    new ResearchService(config.research),
    new WorkQueueService(),
    new WebSearchService(),
    new EphemeralMemoryService(),
    new CDNService(),
    new BlogService(),
  );

  if (config.cdn) {
    for (const name in config.cdn) {
      const cdnConfig = config.cdn[name];
      switch (cdnConfig.type) {
        case "ghost":
          registry.requireFirstServiceByType(CDNService).registerCDN(name, new GhostCDNResource(cdnConfig));
          break;
        case "s3":
          registry.requireFirstServiceByType(CDNService).registerCDN(name, new S3CDNResource(cdnConfig));
          break;
        case "wordpress":
          registry.requireFirstServiceByType(CDNService).registerCDN(name, new WordPressCDNResource(cdnConfig));
          break;
        default:
          throw new Error(`Invalid CDN type for CDN ${name}`);
      }
    }
  }

  if (config.blog) {
    for (const name in config.blog) {
      const blogConfig = config.blog[name];
      switch (blogConfig.type) {
        case "ghost":
          registry.requireFirstServiceByType(BlogService).registerBlog(name, new GhostBlogResource(blogConfig));
          break;
        case "wordpress":
          registry.requireFirstServiceByType(BlogService).registerBlog(name, new WordPressBlogResource(blogConfig));
          break;
        default:
          throw new Error(`Invalid blog type for blog ${name}`);
      }
    }
  }
  
  if (config.websearch) {
    for (const name in config.websearch) {
      const websearchConfig = config.websearch[name];
      switch (websearchConfig.type) {
        case "chrome":
          registry.requireFirstServiceByType(WebSearchService).registerResource(name, new ChromeWebSearchResource(websearchConfig));
          break;
        case "serper":
          registry.requireFirstServiceByType(WebSearchService).registerResource(name, new SerperWebSearchResource(websearchConfig));
          break;
        case "scraperapi":
          registry.requireFirstServiceByType(WebSearchService).registerResource(name, new ScraperAPIWebSearchResource(websearchConfig));
          break;
        default:
          throw new Error(`Invalid websearch type for websearch ${name}`);
      }
    }
  }

  if (config.newsrpm) {
    await registry.services.addServices(new NewsRPMService(config.newsrpm));
  }

  if (config.cloudquote) {
    await registry.services.addServices(new CloudQuoteService(config.cloudquote));
  }

  if (config.wikipedia) {
    await registry.services.addServices(new WikipediaService(config.wikipedia));
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

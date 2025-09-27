#!/usr/bin/env bun
import {AgentStateStorage, AgentTeam, packageInfo as AgentPackage} from "@tokenring-ai/agent";
import AgentContextService from "@tokenring-ai/agent/AgentContextService";
import {ModelRegistry, packageInfo as ChatRouterPackage} from "@tokenring-ai/ai-client";
import AIService from "@tokenring-ai/ai-client/AIService";
import {registerModels} from "@tokenring-ai/ai-client/models";
import {BlogService, packageInfo as BlogPackage} from "@tokenring-ai/blog";
import {CDNService, packageInfo as CDNPackage} from "@tokenring-ai/cdn";
import {ChromeWebSearchProvider, packageInfo as ChromePackage} from "@tokenring-ai/chrome";
import {packageInfo as CLIPackage, REPLService} from "@tokenring-ai/cli";
import {CloudQuoteService, packageInfo as CloudQuotePackage} from "@tokenring-ai/cloudquote";
import {packageInfo as FeedbackPackage} from "@tokenring-ai/feedback";
import {FileSystemService, packageInfo as FilesystemPackage} from "@tokenring-ai/filesystem";
import {GhostBlogProvider, GhostCDNProvider, packageInfo as GhostIOPackage} from "@tokenring-ai/ghost-io";
import {LocalFileSystemService, packageInfo as LocalFileSystemPackage} from "@tokenring-ai/local-filesystem";
import {packageInfo as MemoryPackage, ShortTermMemoryService} from "@tokenring-ai/memory";
import {NewsRPMService, packageInfo as NewsRPMPackage} from "@tokenring-ai/newsrpm";
import {packageInfo as QueuePackage, WorkQueueService} from "@tokenring-ai/queue";
import {packageInfo as RedditPackage, RedditService} from "@tokenring-ai/reddit";
import {packageInfo as ResearchPackage, ResearchService} from "@tokenring-ai/research";
import {packageInfo as S3Package, S3CDNProvider} from "@tokenring-ai/s3";
import {packageInfo as ScraperAPIPackage, ScraperAPIWebSearchProvider} from "@tokenring-ai/scraperapi";
import {packageInfo as ScriptingPackage, ScriptingService} from "@tokenring-ai/scripting";
import {packageInfo as SerperPackage, SerperWebSearchProvider} from "@tokenring-ai/serper";
import {packageInfo as SQLiteChatStoragePackage} from "@tokenring-ai/sqlite-storage";
import initializeLocalDatabase from "@tokenring-ai/sqlite-storage/db/initializeLocalDatabase";
import SQLiteAgentStateStorage from "@tokenring-ai/sqlite-storage/SQLiteAgentStateStorage";
import {packageInfo as TasksPackage, TaskService} from "@tokenring-ai/tasks";
import {packageInfo as TemplatePackage, TemplateService} from "@tokenring-ai/template";
import {packageInfo as WebSearchPackage, WebSearchService} from "@tokenring-ai/websearch";
import {packageInfo as WikipediaPackage, WikipediaService} from "@tokenring-ai/wikipedia";
import {packageInfo as WordPressPackage, WordPressBlogProvider, WordPressCDNProvider} from "@tokenring-ai/wordpress";
import {packageInfo as MCPPackage, MCPService} from "@tokenring-ai/mcp";
import chalk from "chalk";
import {Command} from "commander";
import fs from "node:fs";
import path from "node:path";
import agents from "./agents.ts";
import {WriterConfig} from "./config.types.ts";
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
  const config = configImport.default as WriterConfig;

  const baseDirectory = resolvedSource;
  const db = initializeLocalDatabase(
    path.resolve(configDirectory, "./writer-database.sqlite"),
  );

  const agentTeam = new AgentTeam();
  agentTeam.events.on("serviceOutput", message => {
    console.log(chalk.yellow(`🔧 ${message}`));
  })
  agentTeam.events.on("serviceError", message => {
    console.log(chalk.red(`🔧 ❌ ${message}`));
  })

  await agentTeam.addPackages([
    AgentPackage,
    ChatRouterPackage,
    ChromePackage,
    CLIPackage,
    FeedbackPackage,
    FilesystemPackage,
    LocalFileSystemPackage,
    MCPPackage,
    MemoryPackage,
    QueuePackage,
    RedditPackage,
    ScriptingPackage,
    SQLiteChatStoragePackage,
    TasksPackage
  ]);

  const modelRegistry = new ModelRegistry();
  await registerModels(config.models, modelRegistry);

  const filesystemService = new FileSystemService();

  agentTeam.services.register(
    new AgentContextService(),
    modelRegistry,
    filesystemService,
    new AIService({ model: config.defaults.model}),
    new AgentStateStorage(new SQLiteAgentStateStorage({db})),
    new WorkQueueService(),
    new ShortTermMemoryService(),
    new TaskService(),
    new RedditService()
  );

  config.filesystem ??= {
    providers: {
      local: {
        type: "local",
        baseDirectory,
      }
    }
  }

  if (!config.filesystem.providers) {
    throw new Error(`No filesystem providers configured`);
  }
  for (const name in config.filesystem.providers) {
    const filesystemConfig = config.filesystem.providers[name];
    switch (filesystemConfig.type) {
      case "local":
        filesystemService.registerFileSystemProvider(name, new LocalFileSystemService(filesystemConfig));
        break;
      default:
        throw new Error(`Invalid filesystem type for filesystem ${name}`);
    }
  }
  filesystemService.setActiveFileSystemProviderName(config.filesystem.default?.provider ?? filesystemService.getAvailableFileSystemProviders()[0]);

  if (config.websearch) {
    const websearchService = new WebSearchService();
    agentTeam.services.register(websearchService);
    await agentTeam.addPackages([WebSearchPackage, ChromePackage, SerperPackage, ScraperAPIPackage]);

    for (const name in config.websearch.providers) {
      const websearchConfig = config.websearch.providers[name];
      switch (websearchConfig.type) {
        case "chrome":
          websearchService.registerProvider(name, new ChromeWebSearchProvider(websearchConfig));
          break;
        case "serper":
          websearchService.registerProvider(name, new SerperWebSearchProvider(websearchConfig));
          break;
        case "scraperapi":
          websearchService.registerProvider(name, new ScraperAPIWebSearchProvider(websearchConfig));
          break;
        default:
          throw new Error(`Invalid websearch type for websearch ${name}`);
      }
    }
    if (config.websearch.default?.provider) {
      websearchService.setActiveProvider(config.websearch.default.provider);
    }
  }

  if (config.mcp) {
    const mcpService = new MCPService();
    agentTeam.services.register(mcpService);

    for (const name in config.mcp.transports) {
      await mcpService.register(name,config.mcp.transports[name], agentTeam);
    }
  }

  if (config.cdn) {
    const cdnService = new CDNService();
    agentTeam.services.register(cdnService);
    await agentTeam.addPackages([CDNPackage, GhostIOPackage, S3Package, WordPressPackage]);

    for (const name in config.cdn) {
      const cdnConfig = config.cdn[name];
      switch (cdnConfig.type) {
        case "ghost":
          cdnService.registerProvider(name, new GhostCDNProvider(cdnConfig));
          break;
        case "s3":
          cdnService.registerProvider(name, new S3CDNProvider(cdnConfig));
          break;
        case "wordpress":
          cdnService.registerProvider(name, new WordPressCDNProvider(cdnConfig));
          break;
        default:
          throw new Error(`Invalid CDN type for CDN ${name}`);
      }
    }
  }

  if (config.blog) {
    const blogService = new BlogService();
    agentTeam.services.register(blogService);
    await agentTeam.addPackages([BlogPackage, GhostIOPackage, WordPressPackage]);

    for (const name in config.blog) {
      const blogConfig = config.blog[name];
      switch (blogConfig.type) {
        case "ghost":
          blogService.registerBlog(name, new GhostBlogProvider(blogConfig));
          break;
        case "wordpress":
          blogService.registerBlog(name, new WordPressBlogProvider(blogConfig));
          break;
        default:
          throw new Error(`Invalid blog type for blog ${name}`);
      }
    }
  }

  if (config.newsrpm) {
    agentTeam.services.register(new NewsRPMService(config.newsrpm));
    await agentTeam.addPackages([NewsRPMPackage]);
  }

  if (config.cloudquote) {
    agentTeam.services.register([new CloudQuoteService(config.cloudquote)]);
    await agentTeam.addPackages([CloudQuotePackage]);
  }

  if (config.wikipedia) {
    agentTeam.services.register(new WikipediaService(config.wikipedia));
    await agentTeam.addPackages([WikipediaPackage]);
  }

  if (config.research) {
    agentTeam.services.register(new ResearchService(config.research));
    await agentTeam.addPackages([ResearchPackage]);
  }

  if (config.templates) {
    agentTeam.services.register(new TemplateService(config.templates))
    await agentTeam.addPackages([TemplatePackage]);
  }

  if (config.scripts) {
    agentTeam.services.register(new ScriptingService(config.scripts));
    await agentTeam.addPackages([ScriptingPackage]);
  }

  console.log(chalk.yellow(banner));

  // Initialize agent manager
  for (const name in agents) {
    agentTeam.addAgentConfig(name, agents[name]);
  }

  for (const name in config.agents) {
    agentTeam.addAgentConfig(name, config.agents[name])
  }

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

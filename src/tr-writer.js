#!/usr/bin/env node
import { Command } from "commander";
import fs from "node:fs";
import path from "path";
import { initializeConfigDirectory } from "./initializeConfigDirectory.js";
import { error } from "./prettyString.js";
import initializeLocalDatabase from "@token-ring/sqlite-storage/db/intializeLocalDatabase";
import defaultPersonas from "./defaults/personas.js";

import * as HistoryPackage from "@token-ring/history";
import * as ChatPackage from "@token-ring/chat";
import { ChatService } from "@token-ring/chat";
import * as SQLiteChatStoragePackage from "@token-ring/sqlite-storage";
import {
	SQLiteChatHistoryStorage,
	SQLiteChatCheckpointStorage,
	SQLiteChatMessageStorage,
} from "@token-ring/sqlite-storage";
import * as RegistryPackage from "@token-ring/registry";
import { Registry } from "@token-ring/registry";
import { WorkQueueService } from "@token-ring/queue";
import * as ChatRouterPackage from "@token-ring/ai-client";
import { ModelRegistry } from "@token-ring/ai-client";
import * as MemoryPackage from "@token-ring/memory";
import { EphemeralMemoryService } from "@token-ring/memory";
import * as CLIPackage from "@token-ring/cli";
import { REPLService, ReplHumanInterfaceService } from "@token-ring/cli";
import * as FeedbackPackage from "@token-ring/feedback";
import * as ChromePackage from "@token-ring/chrome";
import * as models from "@token-ring/ai-client/models";
import chalk from "chalk";
import { GhostIOService } from "@token-ring/ghost-io";
import * as GhostPackage from "@token-ring/ghost-io";
import * as TemplatePackage from "@token-ring/template";
import { TemplateRegistry } from "@token-ring/template";
import * as ResearchPackage from "@token-ring/research";

// Create a new Commander program
const program = new Command();

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
  tr-writer --source ./my-app --config ./custom-config.js
`,
	)
	.action(async (options) => {
		try {
			await runWriter(options);
		} catch (err) {
			console.error(error(`Caught Error:`), err);
			process.exit(1);
		}
	});

program.parse();

async function runWriter({ source, config: configFile, initialize }) {
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
		configFile = await initializeConfigDirectory(configDirectory);
	}

	if (!configFile) {
		throw new Error(
			`Source directory ${resolvedSource} does not contain a .tokenring/writer-config.{mjs,cjs,js} file.\n` +
				`You can create one by adding --initialize:\n` +
				`./tr-writer --source ${resolvedSource} --initialize`,
		);
	}

	const { default: config } = await import(
		/* webpackIgnore: true */ configFile
	);

	const registry = new Registry();
	await registry.start();

	await registry.addPackages(
		ChatPackage,
		ChatRouterPackage,
		ChromePackage,
		CLIPackage,
		FeedbackPackage,
		GhostPackage,
		HistoryPackage,
		MemoryPackage,
		RegistryPackage,
		SQLiteChatCheckpointStorage,
		SQLiteChatHistoryStorage,
		SQLiteChatMessageStorage,
		SQLiteChatStoragePackage,
		TemplatePackage,
		ResearchPackage,
	);

	const db = initializeLocalDatabase(
		path.resolve(configDirectory, "./writer-database.sqlite"),
	);

	const { defaults } = config;

	const defaultTools = Object.keys({
		...MemoryPackage.tools,
		...ResearchPackage.tools,
		...(config.ghost ? GhostPackage.tools : {}),
	});

	await registry.tools.enableTools(defaults.tools ?? defaultTools);
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

	await registry.services.addServices(
		chatService,
		new REPLService(),
		new ReplHumanInterfaceService(),
		modelRegistry,
		templateRegistry,
		new SQLiteChatMessageStorage({ db }),
		new SQLiteChatHistoryStorage({ db }),
		new SQLiteChatCheckpointStorage({ db }),
		new WorkQueueService(),
		new EphemeralMemoryService(),
	);

	if (config.ghost) {
		await registry.services.addServices(new GhostIOService(config.ghost));
	}

	//console.log(info(`TokenRing Coder initialized and ready with ${registry.services.getServices().length} resources and ${resourceRegistry.getAvailableResourceNames().length} resources`));
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

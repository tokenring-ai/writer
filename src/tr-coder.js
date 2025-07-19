#!/usr/bin/env node
import { Command } from "commander";
import fs from "node:fs";
import path from "path";
import { initializeConfigDirectory } from "./initializeConfigDirectory.js";
import { error } from "./prettyString.js";
import initializeLocalDatabase from "@token-ring/sqlite-storage/db/intializeLocalDatabase";

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
import * as DockerPackage from "@token-ring/docker";
import { DockerService } from "@token-ring/docker";
//import * as FileIndexPackage from "@token-ring/file-index";
//import { StringSearchFileIndexService } from "@token-ring/file-index";
//import * as MySQLFileIndexPackage from "@token-ring/mysql-file-index";
//import { MySQLFileIndexService } from "@token-ring/mysql-file-index";
//import * as VoicePackage from "@token-ring/voice";
//import { RecordingService, SpeechToTextService } from "@token-ring/voice";
import * as FilesystemPackage from "@token-ring/filesystem";
import * as LocalFileSystemPackage from "@token-ring/local-filesystem";
import { LocalFileSystemService } from "@token-ring/local-filesystem";
import * as TestingPackage from "@token-ring/testing";
import {
	ShellCommandTestingResource,
	TestingService,
} from "@token-ring/testing";
import * as QueuePackage from "@token-ring/queue";
import { WorkQueueService } from "@token-ring/queue";
import * as ChatRouterPackage from "@token-ring/ai-client";
import { ModelRegistry } from "@token-ring/ai-client";
import * as GitPackage from "@token-ring/git";
import { GitService } from "@token-ring/git";
import * as MemoryPackage from "@token-ring/memory";
import { EphemeralMemoryService } from "@token-ring/memory";
import * as CLIPackage from "@token-ring/cli";
import { REPLService, ReplHumanInterfaceService } from "@token-ring/cli";
import * as WorkflowPackage from "@token-ring/workflow";
import { WorkflowService } from "@token-ring/workflow";
//import * as ZohoPackage from "@token-ring/zoho";
//import {ZohoService} from "@token-ring/zoho";
import * as CodebasePackage from "@token-ring/codebase";
import {
	CodeBaseService,
	FileTreeResource,
	WholeFileResource,
} from "@token-ring/codebase";
import * as CodeWatchPackage from "@token-ring/code-watch";
import { CodeWatchService } from "@token-ring/code-watch";
import * as RepoMapPackage from "@token-ring/repo-map";
import { RepoMapResource } from "@token-ring/repo-map";

import * as AWSPackage from "@token-ring/aws";
import * as PlannerPackage from "@token-ring/planner";
import * as KubernetesPackage from "@token-ring/kubernetes";
import * as JavascriptPackage from "@token-ring/javascript";
import * as FeedbackPackage from "@token-ring/feedback";
import * as ChromePackage from "@token-ring/chrome";
import * as DatabasePackage from "@token-ring/database";
//import * as BravePackage from "@token-ring/brave";
import * as FileIndexPackage from "@token-ring/file-index";

//import * as ConfigPackage from '@token-ring/config';
//import { ConfigurationManagementService } from '@token-ring/config';

import * as models from "@token-ring/ai-client/models";
import chalk from "chalk";

// Create a new Commander program
const program = new Command();

program
	.name("tr-coder")
	.description("TokenRing Coder - AI-powered coding assistant")
	.version("1.0.0")
	.requiredOption("-s, --source <path>", "Path to the codebase to work with")
	.option("-c, --config <path>", "Path to the configuration file")
	.option(
		"-i, --initialize",
		"Initialize the source directory with a new config directory",
	)
	.addHelpText(
		"after",
		`
Examples:
  tr-coder --source ./my-app
  tr-coder --source ./my-app --initialize
  tr-coder --source ./my-app --config ./custom-config.js
`,
	)
	.action(async (options) => {
		try {
			await runCoder(options);
		} catch (err) {
			console.error(error(`Caught Error:`), err);
			process.exit(1);
		}
	});

program.parse();

async function runCoder({ source, config: configFile, initialize }) {
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
			const potentialConfig = path.join(configDirectory, `coder-config.${ext}`);
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
			`Source directory ${resolvedSource} does not contain a .tokenring/coder-config.{mjs,cjs,js} file.\n` +
				`You can create one by adding --initialize:\n` +
				`./tr-coder --source ${resolvedSource} --initialize`,
		);
	}

	const { default: config } = await import(
		/* webpackIgnore: true */ configFile
	);

	const registry = new Registry();
	await registry.start();

	await registry.addPackages(
		AWSPackage,
		//BravePackage,
		ChatPackage,
		ChatRouterPackage,
		ChromePackage,
		CLIPackage,
		CodebasePackage,
		CodeWatchPackage,
		//ConfigPackage,
		DatabasePackage,
		DockerPackage,
		FeedbackPackage,
		FileIndexPackage,
		FilesystemPackage,
		GitPackage,
		HistoryPackage,
		JavascriptPackage,
		KubernetesPackage,
		LocalFileSystemPackage,
		MemoryPackage,
		//MySQLFileIndexPackage,
		PlannerPackage,
		QueuePackage,
		RegistryPackage,
		RepoMapPackage,
		SQLiteChatCheckpointStorage,
		SQLiteChatHistoryStorage,
		SQLiteChatMessageStorage,
		SQLiteChatStoragePackage,
		TestingPackage,
		//VoicePackage,
		WorkflowPackage,
		//ZohoPackage
	);

	const baseDirectory = resolvedSource;
	const db = initializeLocalDatabase(
		path.resolve(configDirectory, "./coder-database.sqlite"),
	);

	const { defaults } = config;

	const defaultTools = Object.keys({
		...FilesystemPackage.tools,
		...MemoryPackage.tools,
		//...RepoMapPackage.tools,
	});

	await registry.tools.enableTools(defaults.tools ?? defaultTools);

	//const configurationManagementService = new ConfigurationManagementService(config);

	/*
 You are a deep thinking chatbot, that will recieve a user prompt, which you must think about in great detail. You will output a <think> tag in your response, then think about each asp
ect of the users prompt, thinking about the best way to respond, and after coming up with the best way to handle the users request, you will output a </think> tag, and then responde to the u
ser, and call any tools needed, based on the best course of action that you have just thought about. The user prompt is: Update runChat, cropping the token cost to 4 decimal places
  */

	// Create default personas if not provided in config
	const defaultPersonas = {
		code: {
			instructions:
				"You are an expert developer assistant in an interactive chat, with access to a variety of tools to safely update the users existing codebase and execute tasks the user has requested. " +
				"When the user tells you to do something, you should assume that the user is asking you to use the available tools to update their codebase. " +
				"You should prefer using tools to implement code changes, even large code changes. " +
				"When making code changes, give short and concise responses summarizing the code changes",
			model: "auto:speed>=4,intelligence>=3",
			temperature: 0.2,
			top_p: 0.1,
		},
		"deep-rag": {
			instructions:
				"You are a deep thinking developer assistant in an interactive chat, with access to a variety of tools to safely update the users " +
				"codebase and execute tasks the user has requested. \n" +
				"You will see a variety of message, showing the requests the users has made over time, and a final prompt from the user, with a task " +
				"they would like you to complete or continue. Review the users prompt and prior information, and think deeply about it. " +
				"Then output the tag <think>, and output all of your thought about what the user is telling you to do, and what information you might need to " +
				"complete the task, ending your thoughts with the text </think>" +
				"Then call any tools you need to complete the task, and tell the user whether the task is complete, or whether their are items remaining to complete",
			//model: "auto:speed>=4,intelligence>=3",
			model: "deepseek-chat",
			temperature: 0.2,
			top_p: 0.1,
		},
		"deep-interface-refactorer": {
			instructions:
				"You are a developer charge with designing an elegant, easy to use and understand, reusable interface in an interactive chat" +
				"You will see a variety of messages, showing the code the user has provided, and a final prompt from the user, with the task they would" +
				"like you to complete. Review the users prompt and prior information, and look specifically at the interconnection between the code " +
				"samples provided. Output the tag <code_interconnection>, and think deeply about how each piece of the code interacts with the others, " +
				"working through each call that crosses between files, especially files living in different directories. For each interconnection, " +
				"detail out any tight coupling in the code. Once done, output the tag <interface_design>, and think about how the code can be updated " +
				"to have one or more reusable, scalable, and elegant interfaces. Once done, output the tag <response>, and respond to the user normally, " +
				"with your findings and next steps",
			//model: "auto:speed>=4,intelligence>=3",
			model: "deepseek-chat",
			temperature: 0.2,
			top_p: 0.1,
		},
		"deep-thinker": {
			instructions:
				"You are a deep thinking developer assistant in an interactive chat, with access to a variety of tools to safely update the users " +
				"existing codebase and execute tasks the user has requested. \n" +
				"You will receive a user prompt, which you must think about in great detail. You will output the text <think>, and then think in great " +
				"detail about what the user is telling you to do, writing at a minimum, several paragraphs of thoughts on what the user has told you to do, " +
				"and ending your thoughts with the text </think>. \nThen, based on your thoughts, you will then respond to the user, and call any tools " +
				"needed, to satisfy the users request.",
			model: "auto:speed>=4,intelligence>=3",
			temperature: 0.2,
			top_p: 0.1,
		},
		"code-planner": {
			instructions:
				"You are a deep thinking code planning assistant. Your role is to carefully analyze requirements and create detailed implementation plans. \n" +
				"When given a task, you will output <think> and provide a thorough analysis of the problem, considering multiple approaches, edge cases, " +
				"and potential pitfalls. After your analysis, you will create a step-by-step implementation plan with clear milestones and deliverables. " +
				"End your thoughts with </think> before presenting your plan to the user.",
			model: "auto:reasoning>=5,intelligence>=5",
			temperature: 0.2,
			top_p: 0.7,
		},
		architect: {
			instructions:
				"You are a deep thinking software architect. Your role is to design robust system architectures and make high-level technical decisions. \n" +
				"When given a problem, you will output <think> and analyze the architectural implications, considering scalability, maintainability, " +
				"performance, and trade-offs between different approaches. You will evaluate design patterns and technology choices before presenting " +
				"your architectural recommendations. End your thoughts with </think> before sharing your design.",
			model: "auto:reasoning>=5,intelligence>=5",
			temperature: 0.3,
			top_p: 0.8,
		},
		"code-reviewer": {
			instructions:
				"You are a deep thinking code reviewer. Your role is to critically analyze code for quality, maintainability, and potential issues. \n" +
				"When reviewing code, you will output <think> and provide a thorough analysis covering code structure, potential bugs, performance " +
				"implications, security vulnerabilities, and adherence to best practices. After your analysis, you will provide actionable feedback. " +
				"End your thoughts with </think> before sharing your review findings.",
			model: "auto:reasoning>=5,intelligence>=5",
			temperature: 0.4,
			top_p: 0.9,
		},
	};

 console.log(chalk.greenBright(banner))


 // Initialize the chat context with personas
	const chatService = new ChatService({
		personas: config.personas || defaultPersonas, // Use loaded config
		persona: config.defaults?.persona || "code", // Use loaded config
	});

	const modelRegistry = new ModelRegistry();
	await modelRegistry.initializeModels(models, config.models);

	if (config.additionalModels) {
		//modelRegistry.registerAllModelSpecs(config.additionalModels);
	}

	await registry.services.addServices(
		chatService,
		//configurationManagementService,
		new REPLService(),
		new ReplHumanInterfaceService(),
		modelRegistry,
		new SQLiteChatMessageStorage({ db }),
		new SQLiteChatHistoryStorage({ db }),
		new SQLiteChatCheckpointStorage({ db }),
		new LocalFileSystemService({
			rootDirectory: baseDirectory,
			defaultSelectedFiles: defaults.selectedFiles ?? [],
		}),
		new CodeBaseService(),
		new DockerService(),
		new WorkQueueService(),
		new EphemeralMemoryService(),
		new GitService(),
		//new RecordingService(),
		//new SpeechToTextService(),
		new TestingService(),
		new WorkflowService(),
	);

	/*
 if (false && config.indexedFiles) {
  const databaseURL = process.env.DATABASE_URL;
  if (false && databaseURL) {
   console.log(info(`Using MySQL for Vector + Full Text Search`));

   await registry.services.addServices(
    new MySQLFileIndexService({
     databaseUrl: process.env.DATABASE_URL,
     baseDirectory,
     modelRegistry,
     items: config.indexedFiles
    })
   );
  } else {
   console.log(info(`MySQL not available, using in-memory Full Text Search database`));

   await registry.services.addServices(
    new StringSearchFileIndexService({
     baseDirectory,
     modelRegistry,
     items: config.indexedFiles
    })
   );
  }
 }*/

	if (config.watchedFiles) {
		await registry.services.addServices(
			new CodeWatchService({
				items: config.watchedFiles,
			}),
		);
	}

	/*
 if (config.zoho) {
  await registry.services.addServices(new ZohoService(config.zoho));
 }*/

	for (const resourceName in config.resources ?? {}) {
		let resources = config.resources[resourceName];
		if (!Array.isArray(resources)) resources = [resources];

		await registry.resources.addResource(
			resourceName,
			...resources.map((resource) => {
				switch (resource.type) {
					case "fileTree":
						return new FileTreeResource({
							items: resource.items,
						});
					case "repoMap":
						return new RepoMapResource({
							items: resource.items,
						});
					case "wholeFile":
						return new WholeFileResource({
							items: resource.items,
						});
					case "testing":
						return new ShellCommandTestingResource({
							tests: resource.tests,
						});
					default:
						throw new Error(`Unknown resource type ${resource.type}`);
				}
			}),
		);
	}

	await registry.resources.enableResources(defaults.resources);

	//console.log(info(`TokenRing Coder initialized and ready with ${registry.services.getServices().length} resources and ${resourceRegistry.getAvailableResourceNames().length} resources`));
}


const banner = `
████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██████╗ ██╗███╗   ██╗ ██████╗ 
╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██╔══██╗██║████╗  ██║██╔════╝ 
   ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║██████╔╝██║██╔██╗ ██║██║  ███╗
   ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██╔══██╗██║██║╚██╗██║██║   ██║
   ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║██║  ██║██║██║ ╚████║╚██████╔╝
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
                                                                          
 ██████╗ ██████╗ ██████╗ ███████╗██████╗                                  
██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗                                 
██║     ██║   ██║██║  ██║█████╗  ██████╔╝                                 
██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗                                 
╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║                                 
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝                                 
`;
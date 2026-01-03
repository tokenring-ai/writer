# TokenRing Writer (tr-writer)

## Overview

TokenRing Writer (tr-writer) is an AI-powered content creation and management platform. It provides a unified interface for creating, editing, and managing content with assistance from specialized AI agents. The application supports multiple AI providers, research tools, publishing integrations, and flexible UI options.

## Features

- **Agent-based architecture**: Multiple specialized AI agents for different content creation workflows (writer, managing editor).
- **Interactive chat interface**: Conversational REPL for interacting with AI agents during content creation.
- **Persistent content history**: Sessions and content drafts are saved in a SQLite database.
- **Command system**: Issue commands prefixed with `/` to manage agents, content, and workflows.
- **HTTP server integration**: Start an HTTP server for web-based interaction with the application.
- **Multi-model support**: Support for various AI models from different providers (OpenAI, Anthropic, Google, Cerebras, DeepSeek, Groq, Perplexity, xAI).
- **Research capabilities**: Built-in web search, Wikipedia integration, and research tools for content research.
- **File system integration**: Direct integration with local and cloud file systems (S3, local filesystem).
- **Publishing integrations**: Support for WordPress, Ghost.io, Reddit, blog platforms, and CDN management.
- **Flexible UI options**: Support for different UI implementations (Inquirer, Ink CLI, or headless mode).
- **Task scheduling**: Automated scheduling and task management for content workflows.
- **Checkpoint and state management**: Persistent state and session recovery capabilities.

## Available Agents

TokenRing Writer includes specialized AI agents for different content creation workflows:

- **Content Writer**: Expert content writer specializing in creating engaging, well-structured articles and blog posts. Excels at research, storytelling, and adapting writing style to different audiences. Uses research, blog, and websearch tools.

- **Managing Editor**: Coordinates content creation by searching for trending news topics, evaluating newsworthiness, creating article assignments, and dispatching tasks to specialized writing agents. Uses research, websearch, and agent tools with a max step limit of 75.

## Getting Started

### Prerequisites

- Bun (for local development)
- Git initialized content directory

### Installation (Local Development)

1. **Sync git submodules**: This project uses git submodules that need to be initialized and updated before installation:

   ```bash
   git submodule update --init --recursive
   ```

2. **Install dependencies**: This project uses Bun as the package manager in a monorepo structure:

   ```bash
   bun install
   ```

3. **Run the application**: Use Bun to start the application:

   ```bash
   bun src/tr-writer.ts --source ./path-to-your-content
   ```

### Quick Start (NPM)

Run directly using npx without installation:

```bash
npx @tokenring-ai/writer --source ./path-to-your-content --initialize
```

### Quick Start (Docker)

Pull and run from GitHub Container Registry:

```bash
docker pull ghcr.io/tokenring-ai/writer:latest
docker run -ti --net host $(env | grep '_KEY' | sed 's/^/-e /') -v ./path-to-your-content:/repo:rw ghcr.io/tokenring-ai/writer:latest
```

### Installation (As Local Docker Container)

1. **Sync git submodules**: This project uses git submodules that need to be initialized and updated before installation:

   ```bash
   git submodule update --init --recursive
   ```

2. **Build the docker container**:

   ```bash
   # This command must be run in the root directory of the repo
   docker build -t tokenring-ai/writer:latest -f docker/Dockerfile .
   ```

3. **Run the docker container**:

   ```bash
   docker run -ti --net host $(env | grep '_KEY' | sed 's/^/-e /') -v ./:/repo:rw tokenring-ai/writer:latest
   ```

#### Container Registry

The Docker image is automatically built and published to GitHub Container Registry on version tags. Available tags:

- `latest`: Latest stable release
- `v*.*.*`: Specific version tags
- `main`: Latest build from main branch

```bash
docker pull ghcr.io/tokenring-ai/writer:latest
```

## Initialization

To initialize your content directory with the necessary TokenRing configuration file, run:

```bash
tr-writer --source ./path-to-your-content --initialize
```

This creates a `.tokenring` directory in your project, which stores:

- `writer-config.mjs`: Configuration file for your project
- `writer-database.sqlite`: SQLite database storing your content history
- `.gitignore`: File ignoring database files

## Configuration

The application uses a configuration file located at `.tokenring/writer-config.mjs`. This file can be customized to:

- Configure different AI models and providers
- Set up web search integration
- Configure file system providers
- Set up HTTP server authentication
- Define custom agent configurations

Example configuration structure:

```javascript
export default {
  websearch: {
    providers: {
      serper: {
        type: "serper",
        apiKey: process.env.SERPER_API_KEY,
      },
    },
  },
  filesystem: {
    defaultProvider: "local",
    providers: {
      local: {
        type: "local",
      },
    },
  },
  wikipedia: {
    baseUrl: "https://en.wikipedia.org",
  },
  research: {
    researchModel: "Google:gemini-2.5-flash",
  },
  ai: {
    defaultModel: "Google:gemini-2.5-flash",
    models: {
      // Configure various AI providers
      Anthropic: {
        provider: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      Google: {
        provider: "google",
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      },
      OpenAI: {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
      },
    },
  },
};
```

## Command Line Options

```bash
tr-writer [options]
```

### Options

- `--ui <inquirer|ink|none>`: Select the UI to use for the application (default: inquirer)
- `--workingDirectory <path>`: Path to the working directory (default: cwd)
- `--dataDirectory <path>`: Path to the data directory (default: `<workingDirectory>/.tokenring`)
- `--http [host:port]`: Starts an HTTP server for web-based interaction
- `--httpPassword <user:password>`: Basic auth username and password
- `--httpBearer <user:bearer>`: Bearer token auth username and token

### Examples

```bash
# Run with default settings
tr-writer --source ./content

# Run with custom directories
tr-writer --source ./my-content --dataDirectory ./my-data

# Run with HTTP server
tr-writer --source ./content --http 127.0.0.1:3000

# Run with basic authentication
tr-writer --source ./content --http 127.0.0.1:3000 --httpPassword user:password

# Run with Ink CLI UI
tr-writer --source ./content --ui ink

# Run in headless mode
tr-writer --source ./content --ui none
```

## HTTP Server

The application can start an HTTP server for web-based interaction:

```bash
tr-writer --source ./path-to-content --http 127.0.0.1:3000
```

### Authentication Options

- **Basic Auth**:
  ```bash
  tr-writer --http 127.0.0.1:3000 --httpPassword user:password
  ```

- **Bearer Token Auth**:
  ```bash
  tr-writer --http 127.0.0.1:3000 --httpBearer user:token
  ```

## UI Options

The application supports different UI implementations:

- **Inquirer UI** (default):
  ```bash
  tr-writer --source ./content --ui inquirer
  ```

- **Ink CLI UI**:
  ```bash
  tr-writer --source ./content --ui ink
  ```

- **Headless mode** (no UI):
  ```bash
  tr-writer --source ./content --ui none
  ```

## Chat and Commands

Once started, you enter the agent chat REPL:

- Type natural language queries to interact with AI agents for content creation.
- Use commands with `/` prefix, e.g., `/help`, `/agent switch writer`, `/tools enable`.
- Switch between different agents specialized for writing, editing, research, and publishing.
- Control commands: `/quit` to exit, `/agent list` to see available agents.

### Commands

Some example commands:

- `/help`: Show available commands.
- `/agent list`: List available agents.
- `/agent switch <name>`: Switch to a specific agent.
- `/tools list`: Show available tools.
- `/tools enable <pattern>`: Enable specific tools.
- `/quit`: Exit the application.

## Architecture

- **CLI**: Entry point with argument parsing and agent team initialization (`tr-writer.ts`).
- **Agents**: Specialized AI agents for different content creation tasks (writer, managing editor).
- **Plugins**: 37 integrated plugins providing services for AI, chat, filesystem, research, publishing, and more.
- **Services**: Core services for file system, web search, models, database management, and scheduling.
- **Configuration**: Flexible configuration system supporting multiple models and services.
- **HTTP Server**: Optional web server for remote interaction.
- **UI Frameworks**: Support for both Inquirer and Ink CLI interfaces.

### Plugin Ecosystem

The application integrates the following plugin packages:

- **Core**: @agent, @ai-client, @app, @utility
- **Chat**: @chat, @chat-frontend
- **Content**: @blog, @wordpress, @ghost-io, @reddit
- **Data**: @checkpoint, @drizzle-storage, @vault, @memory
- **Filesystem**: @filesystem, @local-filesystem, @browser-file-system, @s3
- **Research**: @research, @websearch, @wikipedia, @serper
- **Infrastructure**: @web-host, @cli, @cli-ink, @scheduler
- **Integration**: @mcp, @scripting, @tasks, @workflow
- **Audio/Video**: @audio, @linux-audio, @chrome
- **Utility**: @feedback, @queue, @cdn, @cloudquote, @scraperapi, @thinking

## Data Persistence

Content data and sessions are stored in a SQLite database (`writer-database.sqlite`) managed through the Checkpoint service. The database is located in the `.tokenring` directory.

## Environment Variables

The application requires various API keys for external services. Common environment variables include:

- `ANTHROPIC_API_KEY`: Anthropic API key
- `CEREBRAS_API_KEY`: Cerebras API key
- `DEEPSEEK_API_KEY`: DeepSeek API key
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google Gemini API key
- `GROQ_API_KEY`: Groq API key
- `OPENAI_API_KEY`: OpenAI API key
- `PERPLEXITY_API_KEY`: Perplexity API key
- `XAI_API_KEY`: xAI API key
- `SERPER_API_KEY`: Serper API key

## Extensibility

The system supports:

- **Custom agents**: Define new agents with specific roles and capabilities.
- **Multiple AI models**: Support for various providers (OpenAI, Anthropic, Google, Cerebras, DeepSeek, Groq, Perplexity, xAI).
- **Service providers**: Pluggable services for file systems, web search, and content publishing.
- **Tool integration**: Extensible tool system for agent capabilities.
- **UI customization**: Support for different UI frameworks and headless mode.
- **Publishing integrations**: Connect to WordPress, Ghost.io, Reddit, and other platforms.
- **Workflow automation**: Task scheduling and workflow management for automated content pipelines.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

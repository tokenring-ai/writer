# TokenRing Writer (tr-writer)

## Overview

TokenRing Writer (tr-writer) is a unified platform for writing and managing content with AI assistance. It provides a powerful interface where you can create, edit, and manage content, leveraging AI to assist with writing, research, and publishing workflows.

## Features

- **Agent-based architecture**: Multiple specialized AI agents for different content creation tasks (writer, editor, researcher, publisher).
- **Interactive chat interface**: Talk to agents in a conversational REPL for content creation assistance.
- **Persistent content history**: Sessions and content drafts are saved in a SQLite database.
- **Command system**: Issue commands prefixed with `/` to manage agents, content, and workflows.
- **HTTP server integration**: Start an HTTP server for web-based interaction with the application.
- **Multi-model support**: Support for various AI models from different providers (OpenAI, Anthropic, Google, etc.).
- **Research capabilities**: Built-in web search and Wikipedia integration for content research.
- **File system integration**: Direct integration with local and cloud file systems.
- **Flexible UI options**: Support for different UI implementations (Inquirer, Ink CLI, or headless mode).

## Available Agents

TokenRing Writer includes specialized AI agents for different content creation workflows:

- **Content Writer**: Expert content writer specializing in creating engaging, well-structured articles and blog posts. Excels at research, storytelling, and adapting writing style to different audiences.
- **Managing Editor**: Coordinates content creation by searching for trending news topics, evaluating newsworthiness, creating article assignments, and dispatching tasks to specialized writing agents.

## Getting Started

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

### Prerequisites

- Bun (for local development)
- Git initialized content directory

### Installation (local development)

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

### Installation (As local docker container)

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
    },
  },
};
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
- **Agents**: Specialized AI agents for different content creation tasks (writer, editor, researcher, publisher).
- **Services**: Core services for file system, web search, models, and database management.
- **Configuration**: Flexible configuration system supporting multiple models and services.
- **HTTP Server**: Optional web server for remote interaction.
- **UI Frameworks**: Support for both Inquirer and Ink CLI interfaces.

## Data Persistence

Content data and sessions are stored in a SQLite database (`writer-database.sqlite`) managed through the Bun SQLite package. The database is located in the `.tokenring` directory.

## Extensibility

The system supports:

- **Custom agents**: Define new agents with specific roles and capabilities.
- **Multiple AI models**: Support for various providers (OpenAI, Anthropic, Google, etc.).
- **Service providers**: Pluggable services for file systems, web search, and content publishing.
- **Tool integration**: Extensible tool system for agent capabilities.
- **UI customization**: Support for different UI frameworks and headless mode.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is MIT licensed

---

This README provides a high-level overview of the TokenRing Writer (tr-writer) functionality and usage. For detailed command usage, use `/help` inside the chat REPL.
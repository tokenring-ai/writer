# TokenRing Writer (tr-writer)

## Overview

TokenRing Writer (tr-writer) is a unified platform for writing and managing news articles & blog posts. It provides a
powerful interface where you can create, edit, and publish content, leveraging AI to assist with writing, editing,
formatting, and publishing workflows.

## Features

- **Agent-based architecture**: Multiple specialized AI agents for different content creation tasks (writer, editor, researcher, publisher).
- **Interactive chat interface**: Talk to agents in a conversational REPL for content creation assistance.
- **Persistent content history**: Sessions and content drafts are saved in a SQLite database.
- **Command system**: Issue commands prefixed with `/` to manage agents, content, and workflows.
- **Publishing integration**: Works directly with your content directory; can initialize with a TokenRing config.
- **Multi-model support**: Support for various AI models from different providers.
- **Research capabilities**: Built-in web search and Wikipedia integration for content research.
- **File system integration**: Direct integration with local and cloud file systems.

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

1. **Sync git submodules**: This project uses git submodules that need to be initialized and updated before
   installation:
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

1. **Sync git submodules**: This project uses git submodules that need to be initialized and updated before
   installation:
   ```bash
   git submodule update --init --recursive
   ```

2. **Build the docker container**:
   ```bash
   # This command must be run in the root directory of the repo
   docker build -t token-ring/writer:latest -f docker/Dockerfile .
   ```

3. **Run the docker container**:
   ```bash
   docker run -ti --net host $(env | grep '_KEY' | sed 's/^/-e /') -v ./:/repo:rw token-ring/writer:latest
   ```

#### Container Registry

The Docker image is automatically built and published to GitHub Container Registry on version tags. Available tags:

- `latest`: Latest stable release
- `v*.*.*`: Specific version tags
- `main`: Latest build from main branch

```bash
docker pull ghcr.io/tokenring-ai/writer:latest
```

### Initialization

To initialize your content directory with the necessary TokenRing configuration file, pass the --initialize flag after
your content directory.
This will initialize a new .tokenring directory in your project, which stores a writer-config.js config file for your
project that you can customize, as well as a sqlite database which stores your content history.

```
tr-writer --source ./path-to-your-content --initialize
```

This copies a default `.tokenring/writer-config.js` into your content directory.

### Chat and Commands

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

## Architecture

- **CLI**: Entry point with argument parsing and agent team initialization (`tr-writer.ts`).
- **Agents**: Specialized AI agents for different content creation tasks (writer, editor, researcher, publisher).
- **Services**: Core services for file system, web search, models, and database management.
- **Configuration**: Flexible configuration system supporting multiple models and services.

## Data Persistence

Content data and sessions are stored in a SQLite database (`writer-database.sqlite`) managed through the Bun SQLite
package.

## Extensibility

The system supports:
- **Custom agents**: Define new agents with specific roles and capabilities.
- **Multiple AI models**: Support for various providers (OpenAI, Anthropic, Google, etc.).
- **Service providers**: Pluggable services for file systems, web search, and content publishing.
- **Tool integration**: Extensible tool system for agent capabilities.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is MIT licensed

---

This README provides a high-level overview of the TokenRing Writer (tr-writer) functionality and usage. For detailed
command usage, use `/help` inside the chat REPL.

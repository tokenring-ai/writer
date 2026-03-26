# TokenRing Writer (tr-writer)

## Overview

TokenRing Writer (tr-writer) is an AI-powered content creation and management platform. It provides a unified interface for creating, editing, and managing content with assistance from specialized AI agents. The application supports multiple AI providers, research tools, publishing integrations, and flexible UI options.

## Features

- **Agent-based architecture**: Multiple specialized AI agents for different content creation workflows (writer, managing editor).
- **Interactive chat interface**: Conversational REPL for interacting with AI agents during content creation.
- **Persistent content history**: Sessions and content drafts are saved in a SQLite database.
- **Command system**: Issue commands prefixed with `/` to manage agents, content, and workflows.
- **HTTP server integration**: Start an HTTP server for web-based interaction with the application.
- **Multi-model support**: Support for various AI models from different providers (OpenAI, Anthropic, Google, Cerebras, DeepSeek, Groq, Perplexity, xAI, LlamaCpp, OpenRouter, Qwen, ZAI).
- **Research capabilities**: Built-in web search, Wikipedia integration, and research tools for content research.
- **File system integration**: Direct integration with local file systems (POSIX, local filesystem).
- **Publishing integrations**: Support for WordPress, Ghost.io, Reddit, blog platforms, and CDN management.
- **Flexible UI options**: Support for different UI implementations (CLI, or headless mode).
- **Task scheduling**: Automated scheduling and task management for content workflows.
- **Checkpoint and state management**: Persistent state and session recovery capabilities.
- **Audio recording**: Built-in audio recording and transcription capabilities (Linux audio support).
- **Frontend web interface**: Modern React-based web interface for HTTP server mode.
- **Model Context Protocol (MCP)**: Support for MCP integration.
- **Escalation and communication**: Communication escalation capabilities.
- **Template management**: Template-based content creation workflows.
- **Workflow automation**: Workflow automation and task management.
- **Secure data vault**: Secure data storage and management.
- **Memory and context management**: Persistent memory and context tracking.
- **Metrics tracking**: Performance metrics and monitoring.
- **Task queue**: Task queue management for background processing.
- **Chrome integration**: Browser automation capabilities.
- **Cloud quote services**: Cloud quote and pricing integration.
- **Prediction markets**: Integration with Kalshi and Polymarket prediction markets.
- **Email integration**: Email sending and management capabilities.
- **Calendar integration**: Calendar event management and scheduling.
- **Scripting**: Scripting capabilities for custom workflows.
- **ScraperAPI**: Web scraping tools and capabilities.
- **Skills system**: Skills management and integration.
- **Telegram integration**: Telegram bot and messaging support.
- **Thinking/AI reasoning**: AI thinking and reasoning capabilities.

## Available Agents

TokenRing Writer includes specialized AI agents for different content creation workflows:

- **Content Writer** (`writer`): Expert content writer specializing in creating engaging, well-structured articles and blog posts. Excels at research, storytelling, and adapting writing style to different audiences. Uses research, blog, and websearch tools.

- **Managing Editor** (`manager`): Coordinates content creation by searching for trending news topics, evaluating newsworthiness, creating article assignments, and dispatching tasks to specialized writing agents. Uses research, websearch, and agent tools with a max step limit of 75.

## Getting Started

### Prerequisites

- Bun (for local development)
- At least one AI provider API key (see [Environment Variables](#environment-variables))

### Installation (Local Development)

1. **Install dependencies**: This project uses Bun as the package manager in a monorepo structure:

   ```bash
   bun install
   ```

2. **Build the application**:

   ```bash
   bun run build
   ```

3. **Run the application**: Use Bun to start the application:

   ```bash
   bun run writer
   ```

### Quick Start (NPM)

The package is published to npm with the `latest` tag on every version release:

```bash
npx @tokenring-ai/writer

# Run against a specific directory
npx @tokenring-ai/writer --projectDirectory ./your-content
```

### Installation (As Local Docker Container)

The Docker image is automatically built and published to GitHub Container Registry:

```bash
docker pull ghcr.io/tokenring-ai/writer:latest

docker run -ti --rm \
  -v ./your-content:/repo:rw \
  -e OPENAI_API_KEY \
  ghcr.io/tokenring-ai/writer:latest

# With web interface
docker run -ti --rm \
  -p 3000:3000 \
  -v ./your-content:/repo:rw \
  -e OPENAI_API_KEY \
  ghcr.io/tokenring-ai/writer:latest \
  --http 0.0.0.0:3000
```

Or build locally from the repo root:

```bash
docker build -t tokenring-ai/writer:latest -f app/writer/docker/Dockerfile .
```

## Configuration

The application uses a configuration file located at `~/.tokenring/writer-config.mjs` (in the user's home directory). This file can be customized to:
- Configure different AI models and providers
- Set up web search integration
- Configure file system providers
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
      Cerebras: {
        provider: "cerebras",
        apiKey: process.env.CEREBRAS_API_KEY,
      },
      DeepSeek: {
        provider: "deepseek",
        apiKey: process.env.DEEPSEEK_API_KEY,
      },
      Google: {
        provider: "google",
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      },
      Groq: {
        provider: "groq",
        apiKey: process.env.GROQ_API_KEY,
      },
      OpenAI: {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
      },
      Perplexity: {
        provider: "perplexity",
        apiKey: process.env.PERPLEXITY_API_KEY,
      },
      xAi: {
        provider: "xai",
        apiKey: process.env.XAI_API_KEY,
      },
    },
  },
};
```

### Default AI Models

The application tries models in this order, using the first available:

```javascript
defaultModels: [
  'llamacpp:*',                    // Local LlamaCpp models
  'zai:glm-5',                     // ZAI GLM models
  'openrouter:openrouter/auto',    // OpenRouter auto-routing
  'openai:gpt-5-mini',             // OpenAI
  'anthropic:claude-4.5-haiku',    // Anthropic
  'google:gemini-3-flash-preview', // Google
  'xai:grok-code-fast-1',          // xAI
  'deepseek:deepseek-chat',        // DeepSeek
  'qwen3-coder-flash',             // Qwen
  '*'                              // Fallback to any available model
]
```

## Command Line Options

```bash
tr-writer [options]
```

### Options

- `--ui <cli|none>`: Select the UI to use (default: `cli`)
- `--projectDirectory <path>`: Working directory (default: cwd)
- `--dataDirectory <path>`: Data directory for session database, knowledge, etc. (default: `<projectDirectory>/.tokenring`)
- `--acp`: Start in ACP mode over stdin/stdout
- `--http [host:port]`: Start an HTTP server (default host: `127.0.0.1`, random port)
- `--auth`: Require authentication for the web UI (tokens must be provided via `TR_AUTH_PASSWORD` or `TR_AUTH_BEARER` environment variables)
- `--agent <type>`: Agent type to start with (default: `editor`)
- `-p`: Enable shutdown when done

### Examples

```bash
# Interactive mode (default)
tr-writer

# Run against a specific directory
tr-writer --projectDirectory ./my-content

# Start HTTP server with web UI
tr-writer --http 127.0.0.1:3000

# With authentication (requires environment variables)
export TR_AUTH_PASSWORD=user:password
tr-writer --http 127.0.0.1:3000 --auth

# With Bearer token authentication
export TR_AUTH_BEARER=user:token
tr-writer --http 127.0.0.1:3000 --auth

# ACP mode (stdin/stdout)
tr-writer --acp --projectDirectory ./my-content

# Headless mode
tr-writer --ui none

# Start with a specific agent
tr-writer --agent manager "Find trending tech news and write an article"

# Start with shutdown when done
tr-writer -p "Write a blog post about AI trends"
```

## HTTP Server

The application can start an HTTP server for web-based interaction:

```bash
tr-writer --http 127.0.0.1:3000
```

### Authentication

Authentication is configured via environment variables when using the `--auth` flag:

- **Basic Auth** (via `TR_AUTH_PASSWORD`):
  ```bash
  export TR_AUTH_PASSWORD=user:password
  tr-writer --http 127.0.0.1:3000 --auth
  ```

- **Bearer Token Auth** (via `TR_AUTH_BEARER`):
  ```bash
  export TR_AUTH_BEARER=user:token
  tr-writer --http 127.0.0.1:3000 --auth
  ```

- **Both** (users can authenticate with either method):
  ```bash
  export TR_AUTH_PASSWORD=user1:password1
  export TR_AUTH_BEARER=user2:token2
  tr-writer --http 127.0.0.1:3000 --auth
  ```

### Web Interface

The web interface provides:
- Interactive chat with AI agents
- Agent selection and switching
- Workflow management
- Real-time agent responses
- Markdown rendering for content

The frontend is a React-based web application located at `frontend/chat/` that serves as the user interface when running in HTTP server mode. The frontend is automatically built and included in the distribution.

## UI Options

The application supports different UI implementations:

- **CLI UI** (default):
  ```bash
  tr-writer --ui cli
  ```
  - Modern terminal UI framework
  - Animated banners during loading
  - Keyboard-based navigation
  - Rich text formatting

- **Headless mode** (no UI):
  ```bash
  tr-writer --ui none
  ```
  - Backend-only operation
  - Suitable for scheduled tasks or automation

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

The application is built on the TokenRing framework and consists of several components:

- **CLI Entry Point**: Argument parsing and agent team initialization (`src/tr-writer.ts`).
- **Agents**: Specialized AI agents for different content creation tasks (writer, manager).
  - `src/agents/interactive/writer.ts`: Content writer agent
  - `src/agents/interactive/manager.ts`: Managing editor agent
- **Plugins**: 49 integrated plugins providing services for AI, chat, filesystem, research, publishing, and more.
- **Services**: Core services for file system, web search, models, database management, and scheduling.
- **Configuration**: Flexible configuration system supporting multiple models and services.
- **HTTP Server**: Optional web server for remote interaction.
- **UI Frameworks**: Support for CLI interface.
- **Frontend**: React-based web interface for HTTP server mode.

### Plugin Ecosystem

The application integrates 49 plugins providing comprehensive functionality:

- **AI & Agent**:
  - `@tokenring-ai/agent`: Agent orchestration and management
  - `@tokenring-ai/ai-client`: Multi-provider AI integration
  - `@tokenring-ai/thinking`: AI thinking and reasoning capabilities

- **Chat & Interface**:
  - `@tokenring-ai/chat`: Chat service and agent interaction
  - `@tokenring-ai/chat-frontend`: Frontend interface components
  - `@tokenring-ai/cli`: Command-line interface and UI framework
  - `@tokenring-ai/rpc`: Remote procedure call support
  - `@tokenring-ai/acp`: Agent Communication Protocol support

- **Content & Publishing**:
  - `@tokenring-ai/blog`: Blog content management
  - `@tokenring-ai/wordpress`: WordPress integration
  - `@tokenring-ai/ghost-io`: Ghost.io publishing
  - `@tokenring-ai/reddit`: Reddit integration

- **Data & Storage**:
  - `@tokenring-ai/checkpoint`: State persistence and recovery
  - `@tokenring-ai/drizzle-storage`: Database storage layer
  - `@tokenring-ai/vault`: Secure data vault
  - `@tokenring-ai/memory`: Memory and context management
  - `@tokenring-ai/queue`: Task queue management

- **Filesystem & Terminal**:
  - `@tokenring-ai/filesystem`: File system abstraction
  - `@tokenring-ai/terminal`: Terminal operations
  - `@tokenring-ai/posix-system`: POSIX system operations
  - `@tokenring-ai/s3`: Amazon S3 integration

- **Research & Web**:
  - `@tokenring-ai/research`: Research tools and workflows
  - `@tokenring-ai/websearch`: Web search capabilities
  - `@tokenring-ai/wikipedia`: Wikipedia integration
  - `@tokenring-ai/serper`: Serper API integration
  - `@tokenring-ai/scraperapi`: Web scraping tools

- **Market Data**:
  - `@tokenring-ai/kalshi`: Kalshi prediction market integration
  - `@tokenring-ai/polymarket`: Polymarket integration
  - `@tokenring-ai/cloudquote`: Cloud quote services

- **Infrastructure**:
  - `@tokenring-ai/web-host`: Web server and hosting
  - `@tokenring-ai/scheduler`: Task scheduling and automation
  - `@tokenring-ai/escalation`: Communication escalation
  - `@tokenring-ai/template`: Template management
  - `@tokenring-ai/workflow`: Workflow automation

- **Integration & Automation**:
  - `@tokenring-ai/mcp`: Model Context Protocol support
  - `@tokenring-ai/scripting`: Scripting capabilities
  - `@tokenring-ai/tasks`: Task management
  - `@tokenring-ai/lifecycle`: Lifecycle management and hooks

- **Audio & Media**:
  - `@tokenring-ai/audio`: Audio recording and processing
  - `@tokenring-ai/linux-audio`: Linux audio support
  - `@tokenring-ai/chrome`: Chrome browser integration

- **Utility & Communication**:
  - `@tokenring-ai/feedback`: User feedback system
  - `@tokenring-ai/cdn`: CDN management
  - `@tokenring-ai/telegram`: Telegram integration
  - `@tokenring-ai/skills`: Skills management
  - `@tokenring-ai/metrics`: Metrics and monitoring

- **Communication & Scheduling**:
  - `@tokenring-ai/email`: Email integration
  - `@tokenring-ai/calendar`: Calendar integration

## Data Persistence

Content data and sessions are stored in a SQLite database (`coder-database.sqlite`) managed through the Checkpoint service. The database is located in the `~/.tokenring` directory (user's home directory).

## Environment Variables

At least one AI provider key is required:

```bash
export OPENAI_API_KEY=sk-...              # OpenAI
export ANTHROPIC_API_KEY=sk-ant-...      # Anthropic
export GOOGLE_GENERATIVE_AI_API_KEY=...  # Google Gemini
export GROQ_API_KEY=gsk_...              # Groq
export CEREBRAS_API_KEY=...              # Cerebras
export DEEPSEEK_API_KEY=...              # DeepSeek
export PERPLEXITY_API_KEY=...            # Perplexity
export XAI_API_KEY=...                   # xAI
export OPENROUTER_API_KEY=...            # OpenRouter

# Optional: web search
export SERPER_API_KEY=...

# Optional: authentication for HTTP server
export TR_AUTH_PASSWORD=user:password    # Basic auth (username:password)
export TR_AUTH_BEARER=user:token         # Bearer token auth (username:token)
```

## Extensibility

The system supports:

- **Custom agents**: Define new agents with specific roles and capabilities.
- **Multiple AI models**: Support for various providers (OpenAI, Anthropic, Google, Cerebras, DeepSeek, Groq, Perplexity, xAI, LlamaCpp, OpenRouter, Qwen, ZAI).
- **Service providers**: Pluggable services for file systems, web search, and content publishing.
- **Tool integration**: Extensible tool system for agent capabilities.
- **UI customization**: Support for different UI frameworks and headless mode.
- **Publishing integrations**: Connect to WordPress, Ghost.io, Reddit, and other platforms.
- **Workflow automation**: Task scheduling and workflow management for automated content pipelines.
- **MCP integration**: Model Context Protocol support for enhanced AI capabilities.

## Development

### Building

```bash
bun run build
```

### Testing

```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

### Docker Container

```bash
# Build container
docker build -t tr-writer:latest -f docker/Dockerfile .
```

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

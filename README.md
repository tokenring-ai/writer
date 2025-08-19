# TokenRing Writer (tr-writer)

## Overview

TokenRing Writer (tr-writer) is a unified platform for writing and managing news articles & blog posts. It provides a
powerful interface where you can create, edit, and publish content, leveraging AI to assist with writing, editing,
formatting, and publishing workflows.

## Features

- **Content creation and management**: Create, edit, and manage news articles and blog posts in one unified platform.
- **Interactive chat interface**: Talk to the assistant in a conversational REPL for content creation assistance.
- **Persistent content history**: Sessions and content drafts are saved in a SQLite database.
- **Command system**: Issue commands prefixed with `/` to manage content, plugins, queues, checkpoints, commits, and
  more.
- **Publishing integration**: Works directly with your content directory; can initialize with a TokenRing config.
- **Plugin support**: Extend functionality with plugins for various publishing platforms.
- **Multi-line input mode**: Supports multi-line text entry for complex content creation.
- **Queue management**: Batch multiple content tasks to execute sequentially.

## Getting Started

### Prerequisites

- Bun
- Git initialized content directory

### Installation (local)

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

TODO: This is not implemented yet
The Docker image is automatically built and published to GitHub Container Registry on each push to the main branch. You
can pull the latest image with:

```bash
docker pull ghcr.io/[owner]/tokenring-writer:latest
```

Replace `[owner]` with the GitHub repository owner.

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

Once started, you enter the chat REPL:

- Type natural language queries about your content creation and management.
- Use commands with `/` prefix, e.g., `/help`, `/commit`, `/checkpoint create`, `/reset`.
- For multi-line input, type `:paste`, enter your text, then `:end` to submit.
- Control commands: `/quit` to exit, `/history` to browse content history.

### Commands

Some example commands:

- `/help`: Show available commands.
- `/history`: Browse previous content sessions and drafts.

## Architecture

- **CLI**: Entry point with argument parsing and session management (`tr-writer.ts`).
- **Engine**: Core logic for commands, content streaming, and persistent content management.
- **Components**: React-based components for browsing content history.
- **Utility**: Helper functions for logging, file management, and database initialization.

## Data Persistence

Content data and sessions are stored in a SQLite database (`writer-database.sqlite`) managed through the Bun SQLite
package.

## Extensibility

The system supports plugins which can add tools callable by the AI assistant during content creation and management
sessions.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is MIT licensed

---

This README provides a high-level overview of the TokenRing Writer (tr-writer) functionality and usage. For detailed
command usage, use `/help` inside the chat REPL.

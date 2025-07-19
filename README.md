# Coder App

## Overview

The Coder app is an interactive developer assistant tool designed to help you work with your codebase in a conversational manner. It provides a chat interface where you can ask questions, issue commands, and interact with your source code, leveraging AI to assist with code edits, refactors, testing, and more.

## Features

- **Interactive chat interface**: Talk to the assistant in a conversational REPL.
- **Persistent chat history**: Sessions and message threads are saved in a SQLite database.
- **Command system**: Issue commands prefixed with `/` to manage contexts, plugins, queues, checkpoints, commits, rollbacks, and more.
- **Codebase integration**: Works directly with your source directory; can initialize with a TokenRing config.
- **Plugin support**: Extend functionality with plugins.
- **Multi-line input mode**: Supports multi-line text entry for complex queries or commands.
- **Queue management**: Batch multiple chat prompts to execute sequentially.
- **Test execution**: Run tests defined in your coder-config.js.
- **Git integration**: Commit changes or rollback git history from chat commands.

## Getting Started

### Prerequisites

- Node.js 22+
- Git initialized source directory

### Installation (local)

1. **Sync git submodules**: This project uses git submodules that need to be initialized and updated before installation:
   ```bash
   git submodule update --init --recursive
   ```

2. **Install dependencies**: This project uses NPM as the package manager in a monorepo structure:
   ```bash
   npm install
   ```

3. **Run the application**: Use NPM to start the application:
  ```bash
  node src/tr-coder.js --source ./path-to-your-codebase
  ```
### Installation (As local docker container)

1. **Sync git submodules**: This project uses git submodules that need to be initialized and updated before installation:
   ```bash
   git submodule update --init --recursive
   ```

2. **Build the docker container**: 
   ```bash
   docker build -t token-ring/coder:latest -f docker/Dockerfile .
   ```
   
3. **Run the docker container**:
   ```bash
   docker run -ti --net host -v ./:/repo:rw token-ring/coder:latest
   ```

#### Container Registry

The Docker image is automatically built and published to GitHub Container Registry on each push to the main branch. You can pull the latest image with:

```bash
docker pull ghcr.io/[owner]/tokenring-coder:latest
```

Replace `[owner]` with the GitHub repository owner.

### Initialization

To initialize your source directory with the necessary TokenRing configuration file, use:

```
tr-coder --source ./path-to-your-codebase --initialize
```

This copies a default `coder-config.js` into your source directory.

### Chat and Commands

Once started, you enter the chat REPL:

- Type natural language queries about your code.
- Use commands with `/` prefix, e.g., `/help`, `/commit`, `/checkpoint create`, `/reset`.
- For multi-line input, type `:paste`, enter your text, then `:end` to submit.
- Control commands: `/quit` to exit, `/history` to browse chat history.

### Commands

Some example commands:

- `/help`: Show available commands.
- `/checkpoint create [label]`: Save current chat state.
- `/commit`: Commit changes to git with AI-generated message.
- `/rollback [position]`: Rollback git history.
- `/contexts`: Manage chat contexts.
- `/plugins`: Enable or disable plugins.
- `/queue`: Manage a queue of chat prompts.
- `/test [all|<name>]`: Run tests defined in your config.
- `/history`: Browse previous chat sessions and messages.

## Architecture

- **CLI**: Entry point with argument parsing and session management (`tr-coder.js`).
- **REPL**: Interactive chat via command-line (`repl.js`).
- **Engine**: Core logic for commands, chat streaming, and persistent chat management.
- **Components**: React-based components for browsing chat history.
- **Utility**: Helper functions for logging, file management, and database initialization.

## Data Persistence

Chat data and sessions are stored in a SQLite database (`coder-database.sqlite`) managed through the Better-SQLite3 package.

## Extensibility

The system supports plugins which can add tools callable by the AI assistant during chat sessions.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

Specify your license here.

---

This README provides a high-level overview of the Coder App functionality and usage. For detailed command usage, use `/help` inside the chat REPL.

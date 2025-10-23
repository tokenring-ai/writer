import type { AgentConfig } from "@tokenring-ai/agent/types";
import manager from "./agents/manager.js";
import writer from "./agents/writer.ts";

export default {
  writer,
  manager,
} as Record<string, AgentConfig>;
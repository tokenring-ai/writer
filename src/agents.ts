import {AgentConfig} from "@tokenring-ai/agent/Agent";
import manager from "./agents/manager.js";
import writer from "./agents/writer.ts";

export default {
  writer,
  manager,
} as Record<string, AgentConfig>;
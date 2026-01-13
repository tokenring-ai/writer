import {AgentConfig} from "@tokenring-ai/agent/schema";
import manager from "./interactive/manager.ts";
import writer from "./interactive/writer.ts";

export default {
  writer,
  manager,
} as Record<string, AgentConfig>;
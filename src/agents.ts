import {AgentConfig} from "@tokenring-ai/agent/Agent";
import writer from "./agents/writer.ts";
import editor from "./agents/editor.ts";
import researcher from "./agents/researcher.ts";
import publisher from "./agents/publisher.ts";

export default {
  writer,
  editor,
  researcher,
  publisher,
} as Record<string, AgentConfig>;
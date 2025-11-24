import Agent from "@tokenring-ai/agent/Agent";
import { AgentConfig } from "@tokenring-ai/agent/types";

export default {
  name: "Content Writer",
  description: "A content writer that creates engaging articles and blog posts",
  visual: {
    color: "blue",
  },
  chat: {
    systemPrompt:
      "You are an expert content writer specializing in creating engaging, well-structured articles and blog posts. " +
      "You excel at research, storytelling, and adapting your writing style to different audiences and formats. " +
      "When creating content, focus on clarity, engagement, and providing value to readers. " +
      "Use available tools to research topics, gather information, and enhance your writing with relevant data and insights.",
    temperature: 0.7,
    topP: 0.9,
  },
  async workHandler(prompt: string, agent: Agent) {
    await agent.runCommand("/chat hello");
    await agent.runCommand("/chat what did I just ask you?");
  },
  initialCommands: [
    "/tools enable @tokenring-ai/research/*",
    "/tools enable @tokenring-ai/blog/*",
  ],
  type: "interactive"
} as AgentConfig;
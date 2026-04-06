import ACPPlugin from "@tokenring-ai/acp/plugin";
import AgentPlugin from "@tokenring-ai/agent/plugin";
import AIClientPlugin from "@tokenring-ai/ai-client/plugin";
import {TokenRingAppConfigSchema} from "@tokenring-ai/app/schema";
import AudioPlugin from "@tokenring-ai/audio/plugin";
import BlogPlugin from "@tokenring-ai/blog/plugin";
import CalendarPlugin from "@tokenring-ai/calendar/plugin";
import CDNPlugin from "@tokenring-ai/cdn/plugin";
import ChatFrontendPlugin from "@tokenring-ai/chat-frontend/plugin";
import ChatPlugin from "@tokenring-ai/chat/plugin";
import CheckpointPlugin from "@tokenring-ai/checkpoint/plugin";
import ChromePlugin from "@tokenring-ai/chrome/plugin";
import CLIPlugin from "@tokenring-ai/cli/plugin";
import CloudQuotePlugin from "@tokenring-ai/cloudquote/plugin";
import DrizzleStoragePlugin from "@tokenring-ai/drizzle-storage/plugin";
import EmailPlugin from "@tokenring-ai/email/plugin";
import EscalationPlugin from "@tokenring-ai/escalation/plugin";
import FeedbackPlugin from "@tokenring-ai/feedback/plugin";
import FilesystemPlugin from "@tokenring-ai/filesystem/plugin";
import GhostIOPlugin from "@tokenring-ai/ghost-io/plugin";
import GooglePlugin from "@tokenring-ai/google/plugin";
import KalshiPlugin from "@tokenring-ai/kalshi/plugin";
import LifecyclePlugin from "@tokenring-ai/lifecycle/plugin";
import LinuxAudioPlugin from "@tokenring-ai/linux-audio/plugin";
import MCPPlugin from "@tokenring-ai/mcp/plugin";
import MemoryPlugin from "@tokenring-ai/memory/plugin";
import MetricsPlugin from "@tokenring-ai/metrics/plugin";
import PolymarketPlugin from "@tokenring-ai/polymarket/plugin";
import PosixSystemPlugin from "@tokenring-ai/posix-system/plugin";
import QueuePlugin from "@tokenring-ai/queue/plugin";
import RedditPlugin from "@tokenring-ai/reddit/plugin";
import ResearchPlugin from "@tokenring-ai/research/plugin";
import RPCPlugin from "@tokenring-ai/rpc/plugin";
import S3Plugin from "@tokenring-ai/s3/plugin";
import SchedulerPlugin from "@tokenring-ai/scheduler/plugin";
import ScraperAPIPlugin from "@tokenring-ai/scraperapi/plugin";
import ScriptingPlugin from "@tokenring-ai/scripting/plugin";
import SerperPlugin from "@tokenring-ai/serper/plugin";
import SkillsPlugin from "@tokenring-ai/skills/plugin";
import SlackPlugin from "@tokenring-ai/slack/plugin";
import TasksPlugin from "@tokenring-ai/tasks/plugin";
import TelegramPlugin from "@tokenring-ai/telegram/plugin";
import TerminalPlugin from "@tokenring-ai/terminal/plugin";
import ThinkingPlugin from "@tokenring-ai/thinking/plugin";
import TodoPlugin from "@tokenring-ai/todo/plugin";
import VaultPlugin from "@tokenring-ai/vault/plugin";
import WebHostPlugin from "@tokenring-ai/web-host/plugin";
import WebSearchPlugin from "@tokenring-ai/websearch/plugin";
import WikipediaPlugin from "@tokenring-ai/wikipedia/plugin";
import WordPressPlugin from "@tokenring-ai/wordpress/plugin";
import WorkflowPlugin from "@tokenring-ai/workflow/plugin";
import {z} from "zod";

export const plugins = [
  ACPPlugin,
  AgentPlugin,
  AIClientPlugin,
  AudioPlugin,
  BlogPlugin,
  CalendarPlugin,
  CDNPlugin,
  ChatFrontendPlugin,
  ChatPlugin,
  CLIPlugin,
  CheckpointPlugin,
  ChromePlugin,
  CloudQuotePlugin,
  DrizzleStoragePlugin,
  EmailPlugin,
  EscalationPlugin,
  FeedbackPlugin,
  FilesystemPlugin,
  GhostIOPlugin,
  GooglePlugin,
  KalshiPlugin,
  LifecyclePlugin,
  LinuxAudioPlugin,
  PosixSystemPlugin,
  MCPPlugin,
  MemoryPlugin,
  MetricsPlugin,
  PolymarketPlugin,
  QueuePlugin,
  RedditPlugin,
  ResearchPlugin,
  RPCPlugin,
  S3Plugin,
  SchedulerPlugin,
  ScraperAPIPlugin,
  ScriptingPlugin,
  SerperPlugin,
  SlackPlugin,
  SkillsPlugin,
  TasksPlugin,
  TelegramPlugin,
  TerminalPlugin,
  ThinkingPlugin,
  TodoPlugin,
  VaultPlugin,
  WebHostPlugin,
  WebSearchPlugin,
  WikipediaPlugin,
  WordPressPlugin,
  WorkflowPlugin,
];


export const configSchema = z.object({
  ...TokenRingAppConfigSchema.shape,
  ...ACPPlugin.config.shape,
  ...AgentPlugin.config.shape,
  ...AIClientPlugin.config.shape,
  ...AudioPlugin.config.shape,
  ...BlogPlugin.config.shape,
  ...CalendarPlugin.config.shape,
  ...CDNPlugin.config.shape,
  ...ChatFrontendPlugin.config.shape,
  ...ChatPlugin.config.shape,
  ...CLIPlugin.config.shape,
  ...CheckpointPlugin.config.shape,
  ...ChromePlugin.config.shape,
  ...CloudQuotePlugin.config.shape,
  ...DrizzleStoragePlugin.config.shape,
  ...EscalationPlugin.config.shape,
  ...EmailPlugin.config.shape,
  ...FeedbackPlugin.config.shape,
  ...FilesystemPlugin.config.shape,
  ...GhostIOPlugin.config.shape,
  ...GooglePlugin.config.shape,
  ...KalshiPlugin.config.shape,
  ...LifecyclePlugin.config.shape,
  ...LinuxAudioPlugin.config.shape,
  ...PosixSystemPlugin.config.shape,
  ...MetricsPlugin.config.shape,
  ...PolymarketPlugin.config.shape,
  ...MCPPlugin.config.shape,
  ...MemoryPlugin.config.shape,
  ...QueuePlugin.config.shape,
  ...RedditPlugin.config.shape,
  ...ResearchPlugin.config.shape,
  ...RPCPlugin.config.shape,
  ...S3Plugin.config.shape,
  ...SchedulerPlugin.config.shape,
  ...ScraperAPIPlugin.config.shape,
  ...ScriptingPlugin.config.shape,
  ...SerperPlugin.config.shape,
  ...SkillsPlugin.config.shape,
  ...SlackPlugin.config.shape,
  ...TasksPlugin.config.shape,
  ...TelegramPlugin.config.shape,
  ...TerminalPlugin.config.shape,
  ...ThinkingPlugin.config.shape,
  ...TodoPlugin.config.shape,
  ...VaultPlugin.config.shape,
  ...WebHostPlugin.config.shape,
  ...WebSearchPlugin.config.shape,
  ...WikipediaPlugin.config.shape,
  ...WordPressPlugin.config.shape,
  ...WorkflowPlugin.config.shape,
});

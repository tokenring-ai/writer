import {AgentConfig} from "@tokenring-ai/agent/Agent";
import {ModelProviderConfig} from "@tokenring-ai/ai-client/models";
import {ChromeWebSearchOptions} from "@tokenring-ai/chrome/ChromeWebSearchResource";
import {CloudQuoteServiceOptions} from "@tokenring-ai/cloudquote/CloudQuoteService.js";
import {GhostIOServiceOptions} from "@tokenring-ai/ghost-io/GhostBlogResource";
import {GhostCDNResourceOptions} from "@tokenring-ai/ghost-io/GhostCDNResource";
import {NewsRPMConfig} from "@tokenring-ai/newsrpm/NewsRPMService";
import {ResearchServiceConfig} from "@tokenring-ai/research/ResearchService";
import {S3CDNResourceOptions} from "@tokenring-ai/s3";
import {ScraperAPIWebSearchProviderOptions} from "@tokenring-ai/scraperapi/ScraperAPIWebSearchProvider";
import {Script} from "@tokenring-ai/scripting/ScriptingService.js";
import {SerperWebSearchProviderOptions} from "@tokenring-ai/serper/SerperWebSearchProvider";
import {LocalFileSystemProviderOptions} from "@tokenring-ai/local-filesystem/LocalFileSystemProvider";
import {S3FileSystemProviderOptions} from "@tokenring-ai/s3/S3FileSystemProvider";
import {WikipediaConfig} from "@tokenring-ai/wikipedia/WikipediaService";
import {WordPressResourceOptions} from "@tokenring-ai/wordpress/WordPressBlogResource";

export type WebSearchConfig =
  | SerperWebSearchProviderOptions & { type: 'serper' }
  | ScraperAPIWebSearchProviderOptions & { type: 'scraperapi' }
  | ChromeWebSearchOptions & { type: 'chrome' };

export type FileSystemProviderConfig =
  | LocalFileSystemProviderOptions & { type: 'local' }
  | S3FileSystemProviderOptions & { type: 's3' };

export type BlogConfig =
  | GhostIOServiceOptions & { type: 'ghost' }
  | WordPressResourceOptions & { type: 'wordpress' };

export type CDNConfig =
  | GhostCDNResourceOptions & { type: 'ghost' }
  | WordPressResourceOptions & { type: 'wordpress' }
  | S3CDNResourceOptions & { type: 's3' };

export interface WriterConfig {
  defaults: {
    agent: string;
    tools?: string[];
    model: string;
  };
  agents: Record<string, AgentConfig>;
  models: Record<string, ModelProviderConfig>;
  websearch?: Record<string, WebSearchConfig>;
  filesystem?: {
    default?: {
      provider?: string;
    }
    providers: Record<string, FileSystemProviderConfig>;
  };
  blog?: Record<string, BlogConfig>;
  cdn?: Record<string, CDNConfig>;
  newsrpm?: NewsRPMConfig
  cloudquote?: CloudQuoteServiceOptions
  wikipedia?: WikipediaConfig;
  research?: ResearchServiceConfig;
  templates?: Record<string, any>;
  scripts?: Record<string, Script>;
}
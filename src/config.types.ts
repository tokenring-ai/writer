import {AgentConfig} from "@tokenring-ai/agent/Agent";
import {ModelProviderConfig} from "@tokenring-ai/ai-client/models";
import {ChromeWebSearchOptions} from "@tokenring-ai/chrome/ChromeWebSearchProvider";
import {CloudQuoteServiceOptions} from "@tokenring-ai/cloudquote/CloudQuoteService.js";
import {GhostIOServiceOptions} from "@tokenring-ai/ghost-io/GhostBlogProvider";
import {GhostCDNProviderOptions} from "@tokenring-ai/ghost-io/GhostCDNProvider";
import {NewsRPMConfig} from "@tokenring-ai/newsrpm/NewsRPMService";
import {ResearchServiceConfig} from "@tokenring-ai/research/ResearchService";
import {S3CDNProviderOptions} from "@tokenring-ai/s3";
import {ScraperAPIWebSearchProviderOptions} from "@tokenring-ai/scraperapi/ScraperAPIWebSearchProvider";
import {Script} from "@tokenring-ai/scripting/ScriptingService.js";
import {SerperWebSearchProviderOptions} from "@tokenring-ai/serper/SerperWebSearchProvider";
import {LocalFileSystemProviderOptions} from "@tokenring-ai/local-filesystem/LocalFileSystemProvider";
import {S3FileSystemProviderOptions} from "@tokenring-ai/s3/S3FileSystemProvider";
import {WikipediaConfig} from "@tokenring-ai/wikipedia/WikipediaService";
import {WordPressProviderOptions} from "@tokenring-ai/wordpress/WordPressBlogProvider";

export type WebSearchConfig =
  | SerperWebSearchProviderOptions & { type: 'serper' }
  | ScraperAPIWebSearchProviderOptions & { type: 'scraperapi' }
  | ChromeWebSearchOptions & { type: 'chrome' };

export type FileSystemProviderConfig =
  | LocalFileSystemProviderOptions & { type: 'local' }
  | S3FileSystemProviderOptions & { type: 's3' };

export type BlogConfig =
  | GhostIOServiceOptions & { type: 'ghost' }
  | WordPressProviderOptions & { type: 'wordpress' };

export type CDNConfig =
  | GhostCDNProviderOptions & { type: 'ghost' }
  | WordPressProviderOptions & { type: 'wordpress' }
  | S3CDNProviderOptions & { type: 's3' };

export interface WriterConfig {
  defaults: {
    agent: string;
    tools?: string[];
    model: string;
  };
  agents: Record<string, AgentConfig>;
  models: Record<string, ModelProviderConfig>;
  websearch?: {
    default?: {
      provider?: string;
    }
    providers: Record<string, WebSearchConfig>
  };
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
import {ModelConfig} from "@token-ring/ai-client/ModelRegistry";
import {PersonaConfig} from "@token-ring/chat/ChatService";
import {ChromeWebSearchOptions} from "@token-ring/chrome/ChromeWebSearchResource";
import {GhostCDNResourceOptions} from "@token-ring/ghost-io/GhostCDNResource";
import {GhostIOServiceOptions} from "@token-ring/ghost-io/GhostBlogResource";
import {S3CDNResourceOptions} from "@token-ring/s3-cdn";
import {ScraperAPIConfig} from "@token-ring/scraperapi/ScraperAPIWebSearchResource";
import {SerperConfig} from "@token-ring/serper/SerperWebSearchResource";
import {WordPressResourceOptions} from "@token-ring/wordpress/WordPressBlogResource";
import {WordPressCDNResourceOptions} from "@token-ring/wordpress/WordPressCDNResource";
import {CloudQuoteServiceOptions} from "../pkg/cloudquote/CloudQuoteService.js";
import {WikipediaConfig} from "../pkg/wikipedia/WikipediaService.js";

export type BlogConfig =
  | GhostIOServiceOptions & { type: 'ghost' }
  | WordPressResourceOptions & { type: 'wordpress' };

export type CDNConfig =
  | GhostCDNResourceOptions & { type: 'ghost'}
  | S3CDNResourceOptions & { type: 's3'}
  | WordPressCDNResourceOptions & { type: 'wordpress'};

export type WebSearchConfig =
  | SerperConfig & { type: 'serper' }
  | ScraperAPIConfig & { type: 'scraperapi' }
  | ChromeWebSearchOptions & { type: 'chrome' };

export interface WriterConfig {
  defaults: {
    persona: string;
    tools?: string[];
  };
  personas: Record<string, PersonaConfig>;
  blog?: {
    [key: string]: BlogConfig
  };
  websearch?: {
    [key: string]: WebSearchConfig
  };
  cloudquote?: CloudQuoteServiceOptions;
  scraperapi?: {
    apiKey: string;
    countryCode?: string;
    tld?: string;
    outputFormat?: 'json' | 'csv';
    render?: boolean;
    deviceType?: 'desktop' | 'mobile';
  };
  serper?: {
    apiKey: string;
    gl?: string;
    hl?: string;
    location?: string;
    num?: number;
    page?: number;
  };
  newsrpm?: {
    apiKey: string;
    authMode?: 'privateHeader' | 'publicHeader' | 'privateQuery' | 'publicQuery';
    baseUrl?: string;
    defaults?: { timeoutMs?: number };
    retry?: { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number; jitter?: boolean };
  };
  research: {
    researchModel: string;
  };
  wikipedia?: WikipediaConfig;
  cdn?: {
    [key: string]: CDNConfig
  },
  models: Record<string, ModelConfig>;
  templates: Record<string, any>;
}

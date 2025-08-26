import {ModelConfig} from "@token-ring/ai-client/ModelRegistry";
import {PersonaConfig} from "@token-ring/chat/ChatService";
import {GhostCDNResourceOptions} from "@token-ring/ghost-io/GhostCDNResource";
import {GhostIOServiceOptions} from "@token-ring/ghost-io/GhostIOService";
import {S3CDNResourceOptions} from "@token-ring/s3-cdn";

export interface WriterConfig {
  defaults: {
    persona: string;
    tools?: string[];
  };
  personas: Record<string, PersonaConfig>
  ghost?: GhostIOServiceOptions;
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
  cdn?: {
    ghost?: GhostCDNResourceOptions,
    s3?: S3CDNResourceOptions
  },
  models: Record<string, ModelConfig>;
  templates: Record<string, any>;
}

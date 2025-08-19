import {ModelConfig} from "@token-ring/ai-client/ModelRegistry";
import {PersonaConfig} from "@token-ring/chat/ChatService";

export interface WriterConfig {
  defaults: {
    persona: string;
    tools?: string[];
  };
  personas: Record<string, PersonaConfig>
  ghost?: {
    adminApiKey: string;
    contentApiKey: string;
    url: string;
  };
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
  models: Record<string, ModelConfig>;
  templates: Record<string, any>;
}


export interface ResourceConfig {
  type: 'fileTree' | 'repoMap' | 'wholeFile' | 'shell-testing';
  name?: string;
  description: string;
  items: Array<{
    path: string;
    include?: RegExp;
    exclude?: RegExp;
  }>;
  command?: string;
  workingDirectory?: string;
}
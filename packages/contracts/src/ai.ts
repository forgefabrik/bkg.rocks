export type RoutingStrategy = 'lowest_cost' | 'best_quality' | 'latency' | 'round_robin' | 'manual';
export type ModelCapability = 'chat' | 'completion' | 'embedding' | 'image' | 'audio' | 'tools' | 'streaming';
export type ProviderRequestRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ModelCatalogEntry {
  id: string;
  provider: string;
  providerModelId: string;
  displayName: string;
  capabilities: ModelCapability[];
  contextWindowTokens: number;
  maxOutputTokens?: number;
  inputCostPerMillionTokensUsd: number;
  outputCostPerMillionTokensUsd: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelCatalog {
  id: string;
  provider: string;
  version: string;
  entries: ModelCatalogEntry[];
  syncedAt: Date;
}

export interface RoutingPolicy {
  id: string;
  projectId: string;
  name: string;
  strategy: RoutingStrategy;
  allowedProviders: string[];
  preferredModels: string[];
  fallbackOrder: string[];
  maxRetries: number;
  timeoutMs: number;
  maxCostUsd?: number;
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    resetMs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderMessage {
  role: ProviderRequestRole;
  content: string;
  toolCallId?: string;
  toolName?: string;
}

export interface ProviderTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export interface ProviderRequest {
  id: string;
  projectId?: string;
  userId?: string;
  provider: string;
  model: string;
  routingPolicyId?: string;
  messages: ProviderMessage[];
  tools?: ProviderTool[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  timeoutMs?: number;
  stream?: boolean;
  responseFormat?: string;
  createdAt: Date;
}

/**
 * LLM Provider Types
 */

export type LLMProvider = 'gemini' | 'openai' | 'llama';

export interface LLMModelConfig {
  name: string;
  provider: LLMProvider;
  maxTokens: number;
  contextWindow: number;
  temperature: number;
  topP?: number;
  topK?: number;
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export interface LLMResponse {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  finishReason: string;
  model: string;
  provider: LLMProvider;
}

export interface LLMProviderInterface {
  generate(request: LLMRequest): Promise<LLMResponse>;
  getModelInfo(): LLMModelConfig;
}

/**
 * Available LLM Models
 */
export const LLM_MODELS: Record<string, LLMModelConfig> = {
  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro',
    provider: 'gemini',
    maxTokens: 8192,
    contextWindow: 1000000,
    temperature: 0.7,
    topP: 0.95,
    topK: 40
  },
  'gemini-1.5-flash': {
    name: 'gemini-1.5-flash',
    provider: 'gemini',
    maxTokens: 8192,
    contextWindow: 1000000,
    temperature: 0.7,
    topP: 0.95,
    topK: 40
  },
  'gpt-4o': {
    name: 'gpt-4o',
    provider: 'openai',
    maxTokens: 4096,
    contextWindow: 128000,
    temperature: 0.7,
    topP: 0.95
  },
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 4096,
    contextWindow: 128000,
    temperature: 0.7,
    topP: 0.95
  },
  'gpt-4-turbo': {
    name: 'gpt-4-turbo',
    provider: 'openai',
    maxTokens: 4096,
    contextWindow: 128000,
    temperature: 0.7,
    topP: 0.95
  }
};

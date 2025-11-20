import { LLMProviderInterface, LLMProvider } from '../models/llm';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { config } from '../config';
import { logger } from '../utils/logger';

export class LLMProviderFactory {
  private static providers: Map<string, LLMProviderInterface> = new Map();

  static getProvider(provider?: LLMProvider, modelName?: string): LLMProviderInterface {
    const targetProvider = provider || config.llm.defaultProvider;
    const targetModel = modelName || config.llm.defaultModel;

    const cacheKey = `${targetProvider}:${targetModel}`;

    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey)!;
    }

    let instance: LLMProviderInterface;

    switch (targetProvider) {
      case 'gemini':
        if (!config.llm.gemini.enabled) {
          throw new Error('Gemini provider não está habilitado. Configure GEMINI_API_KEY.');
        }
        instance = new GeminiProvider(targetModel);
        break;

      case 'openai':
        if (!config.llm.openai.enabled) {
          throw new Error('OpenAI provider não está habilitado. Configure OPENAI_API_KEY.');
        }
        instance = new OpenAIProvider(targetModel);
        break;

      case 'llama':
        throw new Error('Llama provider ainda não implementado');

      default:
        throw new Error(`Provider desconhecido: ${targetProvider}`);
    }

    this.providers.set(cacheKey, instance);

    logger.info(`LLM Provider criado e cacheado: ${cacheKey}`);

    return instance;
  }

  static clearCache(): void {
    this.providers.clear();
    logger.info('Cache de LLM providers limpo');
  }
}

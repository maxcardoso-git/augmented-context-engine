import OpenAI from 'openai';
import { LLMProviderInterface, LLMRequest, LLMResponse, LLMModelConfig, LLM_MODELS } from '../models/llm';
import { config } from '../config';
import { logger } from '../utils/logger';

export class OpenAIProvider implements LLMProviderInterface {
  private client: OpenAI;
  private modelConfig: LLMModelConfig;

  constructor(modelName: string = 'gpt-4o') {
    if (!config.llm.openai.apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    this.client = new OpenAI({
      apiKey: config.llm.openai.apiKey,
    });

    this.modelConfig = LLM_MODELS[modelName] || LLM_MODELS['gpt-4o'];

    logger.info(`OpenAIProvider inicializado com modelo: ${this.modelConfig.name}`);
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: request.prompt
      });

      const completion = await this.client.chat.completions.create({
        model: this.modelConfig.name,
        messages,
        temperature: request.temperature ?? this.modelConfig.temperature,
        top_p: request.topP ?? this.modelConfig.topP,
        max_tokens: request.maxTokens ?? this.modelConfig.maxTokens,
        stop: request.stopSequences,
      });

      const choice = completion.choices[0];
      const text = choice.message.content || '';

      const tokensInput = completion.usage?.prompt_tokens || 0;
      const tokensOutput = completion.usage?.completion_tokens || 0;

      const duration = Date.now() - startTime;

      logger.info('OpenAI generate completado', {
        model: this.modelConfig.name,
        tokensInput,
        tokensOutput,
        durationMs: duration
      });

      return {
        text,
        tokensInput,
        tokensOutput,
        finishReason: choice.finish_reason || 'stop',
        model: this.modelConfig.name,
        provider: 'openai'
      };

    } catch (error: any) {
      logger.error('Erro ao chamar OpenAI API', {
        error: error.message,
        model: this.modelConfig.name
      });
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  getModelInfo(): LLMModelConfig {
    return this.modelConfig;
  }
}

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { LLMProviderInterface, LLMRequest, LLMResponse, LLMModelConfig, LLM_MODELS } from '../models/llm';
import { config } from '../config';
import { logger } from '../utils/logger';

export class GeminiProvider implements LLMProviderInterface {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelConfig: LLMModelConfig;

  constructor(modelName: string = config.llm.defaultModel) {
    if (!config.llm.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    this.client = new GoogleGenerativeAI(config.llm.gemini.apiKey);
    this.modelConfig = LLM_MODELS[modelName] || LLM_MODELS['gemini-1.5-pro'];

    this.model = this.client.getGenerativeModel({
      model: this.modelConfig.name,
    });

    logger.info(`GeminiProvider inicializado com modelo: ${this.modelConfig.name}`);
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const generationConfig = {
        temperature: request.temperature ?? this.modelConfig.temperature,
        topP: request.topP ?? this.modelConfig.topP,
        topK: request.topK ?? this.modelConfig.topK,
        maxOutputTokens: request.maxTokens ?? this.modelConfig.maxTokens,
        stopSequences: request.stopSequences,
      };

      // Construir prompt completo
      const fullPrompt = request.systemPrompt
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      // Estimar tokens (Gemini não retorna contagem precisa via API)
      const tokensInput = Math.ceil(fullPrompt.length / 4);
      const tokensOutput = Math.ceil(text.length / 4);

      const duration = Date.now() - startTime;

      logger.info('Gemini generate completado', {
        model: this.modelConfig.name,
        tokensInput,
        tokensOutput,
        durationMs: duration
      });

      return {
        text,
        tokensInput,
        tokensOutput,
        finishReason: response.candidates?.[0]?.finishReason || 'STOP',
        model: this.modelConfig.name,
        provider: 'gemini'
      };

    } catch (error: any) {
      logger.error('Erro ao chamar Gemini API', {
        error: error.message,
        model: this.modelConfig.name
      });
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  getModelInfo(): LLMModelConfig {
    return this.modelConfig;
  }
}

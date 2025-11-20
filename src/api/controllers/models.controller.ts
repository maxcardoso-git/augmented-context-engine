import { Request, Response } from 'express';
import { LLM_MODELS } from '../../models/llm';
import { config } from '../../config';

export async function listModels(req: Request, res: Response) {
  const models = Object.values(LLM_MODELS).map(model => ({
    name: model.name,
    provider: model.provider,
    default: model.name === config.llm.defaultModel,
    max_tokens: model.maxTokens,
    context_window: model.contextWindow,
    status: getModelStatus(model.provider)
  }));

  res.status(200).json({
    models,
    default_provider: config.llm.defaultProvider,
    default_model: config.llm.defaultModel
  });
}

function getModelStatus(provider: string): string {
  switch (provider) {
    case 'gemini':
      return config.llm.gemini.enabled ? 'available' : 'disabled';
    case 'openai':
      return config.llm.openai.enabled ? 'available' : 'disabled';
    default:
      return 'unavailable';
  }
}

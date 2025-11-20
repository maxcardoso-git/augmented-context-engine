import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { config } from '../config';

export const metricsRegistry = new Registry();

// Adicionar métricas padrão (CPU, memória, etc.)
if (config.observability.metricsEnabled) {
  const collectDefaultMetrics = require('prom-client').collectDefaultMetrics;
  collectDefaultMetrics({ register: metricsRegistry });
}

// Contador de requests totais
export const requestsTotal = new Counter({
  name: 'ace_requests_total',
  help: 'Total de requisições recebidas',
  labelNames: ['method', 'endpoint', 'status_code', 'tenant_id'],
  registers: [metricsRegistry],
});

// Histograma de latência
export const requestLatency = new Histogram({
  name: 'ace_latency_ms',
  help: 'Latência das requisições em milissegundos',
  labelNames: ['method', 'endpoint', 'tenant_id'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000],
  registers: [metricsRegistry],
});

// Contador de erros
export const errorsTotal = new Counter({
  name: 'ace_errors_total',
  help: 'Total de erros',
  labelNames: ['error_type', 'endpoint', 'tenant_id'],
  registers: [metricsRegistry],
});

// Tokens consumidos (input)
export const llmTokensInput = new Counter({
  name: 'ace_llm_tokens_input_total',
  help: 'Total de tokens de input consumidos pelos LLMs',
  labelNames: ['provider', 'model', 'use_case'],
  registers: [metricsRegistry],
});

// Tokens gerados (output)
export const llmTokensOutput = new Counter({
  name: 'ace_llm_tokens_output_total',
  help: 'Total de tokens de output gerados pelos LLMs',
  labelNames: ['provider', 'model', 'use_case'],
  registers: [metricsRegistry],
});

// Latência de LLM
export const llmLatency = new Histogram({
  name: 'ace_llm_latency_ms',
  help: 'Latência das chamadas LLM em milissegundos',
  labelNames: ['provider', 'model'],
  buckets: [100, 500, 1000, 2000, 5000, 10000, 20000, 30000],
  registers: [metricsRegistry],
});

// Análises por modo
export const analysesByMode = new Counter({
  name: 'ace_analyses_by_mode_total',
  help: 'Total de análises por modo',
  labelNames: ['mode', 'tenant_id'],
  registers: [metricsRegistry],
});

// Insights gerados
export const insightsGenerated = new Counter({
  name: 'ace_insights_generated_total',
  help: 'Total de insights gerados',
  labelNames: ['category', 'priority', 'tenant_id'],
  registers: [metricsRegistry],
});

// Anomalias detectadas
export const anomaliesDetected = new Counter({
  name: 'ace_anomalies_detected_total',
  help: 'Total de anomalias detectadas',
  labelNames: ['severity', 'tenant_id'],
  registers: [metricsRegistry],
});

// Ações recomendadas
export const actionsRecommended = new Counter({
  name: 'ace_actions_recommended_total',
  help: 'Total de ações recomendadas',
  labelNames: ['action_type', 'urgency', 'tenant_id'],
  registers: [metricsRegistry],
});

// Cache hits/misses
export const cacheHits = new Counter({
  name: 'ace_cache_hits_total',
  help: 'Total de cache hits',
  labelNames: ['cache_type'],
  registers: [metricsRegistry],
});

export const cacheMisses = new Counter({
  name: 'ace_cache_misses_total',
  help: 'Total de cache misses',
  labelNames: ['cache_type'],
  registers: [metricsRegistry],
});

// Gauge de análises em progresso
export const analysesInProgress = new Gauge({
  name: 'ace_analyses_in_progress',
  help: 'Número de análises atualmente em progresso',
  labelNames: ['tenant_id'],
  registers: [metricsRegistry],
});

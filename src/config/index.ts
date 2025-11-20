import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Service
  service: {
    name: process.env.SERVICE_NAME || 'ace-cag',
    version: process.env.SERVICE_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10)
  },

  // LLM Providers
  llm: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      enabled: !!process.env.GEMINI_API_KEY
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      enabled: !!process.env.OPENAI_API_KEY
    },
    defaultProvider: (process.env.DEFAULT_LLM_PROVIDER || 'gemini') as 'gemini' | 'openai',
    defaultModel: process.env.DEFAULT_LLM_MODEL || 'gemini-1.5-pro'
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    rateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // Redis
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS || '900', 10)
  },

  // Observability
  observability: {
    logLevel: process.env.LOG_LEVEL || 'info',
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    tracingEnabled: process.env.TRACING_ENABLED !== 'false',
    otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'
  },

  // Analysis
  analysis: {
    maxTokensDefault: parseInt(process.env.MAX_TOKENS_DEFAULT || '800', 10),
    maxInsightsDefault: parseInt(process.env.MAX_INSIGHTS_DEFAULT || '5', 10),
    maxDepthDefault: parseInt(process.env.MAX_DEPTH_DEFAULT || '3', 10),
    timeoutMs: parseInt(process.env.ANALYSIS_TIMEOUT_MS || '30000', 10)
  },

  // Multi-tenancy
  multiTenant: {
    enabled: process.env.MULTI_TENANT_ENABLED !== 'false'
  }
};

export default config;

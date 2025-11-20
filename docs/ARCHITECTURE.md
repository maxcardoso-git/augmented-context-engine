# Arquitetura ACE - Augmented Context Engine

## Visão Geral

O ACE é um microserviço stateless especializado em análise semântica de dados usando o padrão **CAG (Context Augmented Generation)**. Ele transforma dados brutos e estatísticos em contexto semântico aumentado para orientar agentes, assistentes e automações inteligentes.

## Arquitetura de Alto Nível

```
┌──────────────────────────────────────────────────────────────┐
│                    Ecosystem Externo                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐      ┌─────────┐      ┌────────────┐       │
│  │Orquestrador │─────>│   FSB   │─────>│ Analytics  │       │
│  └──────┬──────┘      └─────────┘      └────────────┘       │
│         │                                                     │
│         │ Monta Payload                                      │
│         ↓                                                     │
│  ┌─────────────────────────────────────────────────┐         │
│  │                                                 │         │
│  │                ACE Service                      │         │
│  │                                                 │         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │         │
│  │  │   API    │→ │  Core    │→ │   LLM    │     │         │
│  │  │  Layer   │  │ Analysis │  │ Provider │     │         │
│  │  └──────────┘  └──────────┘  └──────────┘     │         │
│  │                                                 │         │
│  └─────────────────────────────────────────────────┘         │
│         │                                                     │
│         │ Retorna Insights + Ações                           │
│         ↓                                                     │
│  ┌─────────────┐                                             │
│  │   Worker    │ (Executa ações)                            │
│  └─────────────┘                                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Camadas da Arquitetura

### 1. API Layer

**Responsabilidades:**
- Receber requisições HTTP
- Validar payloads (Zod schemas)
- Autenticação e autorização
- Rate limiting
- Logging de requests
- Tratamento de erros

**Componentes:**
- Express.js server
- Controllers (health, analyze, models, metrics)
- Middlewares (auth, validation, error handling)
- Rotas (/health, /analyze, /models, /metrics)

### 2. Core Analysis Layer

**Responsabilidades:**
- Análise estatística
- Detecção de anomalias
- Cálculo de correlações
- Construção de prompts
- Orquestração da análise

**Componentes:**
- `StatisticalAnalyzer`: Análise matemática e estatística
- `PromptBuilder`: Construção de prompts contextualizados
- `ACEService`: Orquestração principal do fluxo CAG

**Algoritmos:**
- Z-score para detecção de anomalias
- Correlação de Pearson
- Normalização e padronização
- Cálculo de médias e desvios

### 3. LLM Provider Layer

**Responsabilidades:**
- Abstração de diferentes providers LLM
- Gestão de tokens
- Retry e error handling
- Rate limiting específico de provider

**Componentes:**
- `LLMProviderInterface`: Interface comum
- `GeminiProvider`: Integração Google Gemini
- `OpenAIProvider`: Integração OpenAI
- `LLMProviderFactory`: Factory pattern para instanciação

**Providers Suportados:**
- Google Gemini (1.5 Pro, 1.5 Flash)
- OpenAI (GPT-4o, GPT-4o-mini, GPT-4 Turbo)
- Llama 3.1 (self-hosted) - planejado

### 4. Observability Layer

**Componentes:**
- **Logging**: Winston (JSON estruturado)
- **Metrics**: Prometheus (prom-client)
- **Tracing**: OpenTelemetry (planejado)

**Métricas Principais:**
- `ace_requests_total`: Total de requisições
- `ace_latency_ms`: Histograma de latência
- `ace_errors_total`: Total de erros
- `ace_llm_tokens_input_total`: Tokens consumidos (input)
- `ace_llm_tokens_output_total`: Tokens gerados (output)
- `ace_analyses_by_mode_total`: Análises por modo
- `ace_insights_generated_total`: Insights gerados
- `ace_anomalies_detected_total`: Anomalias detectadas
- `ace_actions_recommended_total`: Ações recomendadas

### 5. Data Models Layer

**Schemas (Zod):**
- Request/Response schemas
- Validation schemas
- Type inference TypeScript

**Principais Types:**
- `AnalyzeRequest`: Input da análise
- `AnalyzeResponse`: Output estruturado
- `FSBFeatures`: Features estatísticas
- `AnalyticData`: Dados analíticos (tabelas)
- `Insight`, `Action`, `Anomaly`, `Correlation`

## Fluxo de Dados Detalhado

### 1. Request Entry

```
HTTP POST /sas-cag/v1/analyze
  ↓
[Request ID Middleware] → Adiciona/valida request_id
  ↓
[Auth Middleware] → Valida Bearer token
  ↓
[Tenant Middleware] → Extrai tenant_id
  ↓
[Validation Middleware] → Valida payload (Zod)
  ↓
[Analyze Controller]
```

### 2. Core Processing

```
ACEService.analyze()
  ↓
StatisticalAnalyzer.analyze()
  ├─> Detecta anomalias (Z-score)
  ├─> Calcula correlações (Pearson)
  └─> Gera estatísticas descritivas
  ↓
PromptBuilder.buildPrompts()
  ├─> System prompt (baseado em mode + language)
  ├─> Analysis prompt (dados + contexto + instrução)
  └─> Output format instructions
  ↓
LLMProvider.generate()
  ├─> Chama API LLM
  ├─> Registra métricas (tokens, latência)
  └─> Retorna texto
  ↓
Parse LLM Response
  ├─> Extrai JSON
  ├─> Valida estrutura
  └─> Fallback se necessário
  ↓
Build Response
  ├─> Semantic context
  ├─> Insights
  ├─> Actions
  ├─> Anomalies (da análise estatística)
  ├─> Correlations
  ├─> Meta (tokens, duration, etc)
  └─> Debug (opcional)
```

### 3. Response Return

```
[Analyze Controller] → Registra métricas
  ↓
[Express] → JSON response
  ↓
HTTP 200 OK
```

## Loop CAG (Context Augmented Generation)

### Capture
- Recebe dados do FSB (features estatísticas)
- Recebe dados analíticos (tabelas, métricas)
- Recebe metadados de contexto
- Recebe documentos complementares (opcional)

### Analyze
- Análise estatística matemática
- Detecção de anomalias
- Identificação de correlações
- Construção de contexto semântico
- Prompt engineering dinâmico
- Chamada ao LLM

### Generate
- Contexto semântico aumentado
- Insights categorizados e priorizados
- Ações recomendadas com urgência
- Drivers de causa-efeito
- Scores de risco
- Explicações em linguagem natural

## Padrões de Design

### 1. Factory Pattern
`LLMProviderFactory` para criar instâncias de providers LLM de forma centralizada.

### 2. Strategy Pattern
Diferentes modos de análise (`semantic_summary`, `root_cause`, `mixed`, etc) implementam estratégias diferentes.

### 3. Builder Pattern
`PromptBuilder` constrói prompts complexos de forma incremental.

### 4. Singleton Pattern (implícito)
Providers LLM são cacheados no Factory para reutilização.

### 5. Middleware Chain
Express middlewares formam cadeia de responsabilidade.

## Decisões Arquiteturais

### Stateless Design
- ACE não mantém estado entre requests
- Permite escalonamento horizontal fácil
- Cache opcional (Redis) apenas para performance

### Microservice Architecture
- Responsabilidade única (análise semântica)
- API REST bem definida
- Independência de deploy
- Fácil integração com outros serviços

### Schema Validation
- Validação rigorosa com Zod
- Type safety em TypeScript
- Documentação via código

### Multi-Provider LLM
- Não lock-in em um provider
- Fallback entre providers
- Otimização de custo (usar modelo adequado)

### Observability First
- Logging estruturado
- Métricas Prometheus
- Correlation IDs
- Distributed tracing ready

## Escalabilidade

### Horizontal Scaling
- Stateless permite múltiplas instâncias
- Load balancer distribui carga
- HPA em Kubernetes

### Vertical Scaling
- Node.js single-threaded
- Ajustar heap size conforme necessário
- Monitorar uso de CPU/memória

### Caching Strategy
- Redis para cache de resultados (idempotência)
- Cache de modelos LLM na memória
- TTL configurável

## Segurança

### Autenticação
- Bearer Token (JWT)
- Validação de scopes
- Multi-tenancy via X-Tenant-Id

### Validação de Input
- Zod schemas rigorosos
- Sanitização automática
- Proteção contra injection

### Dados Sensíveis
- Mascaramento em logs
- Não persistência de PII
- HTTPS obrigatório em produção

### Rate Limiting
- Por tenant
- Por use_case
- Proteção contra DDoS

## Performance

### Otimizações
- Async/await para I/O
- Streaming responses (futuro)
- Connection pooling (Redis)
- LLM response caching

### Benchmarks Esperados
- Latência P50: < 2s
- Latência P95: < 5s
- Latência P99: < 10s
- Throughput: 100+ req/s (com cache)

## Extensibilidade

### Adicionar Novo Provider LLM
1. Implementar `LLMProviderInterface`
2. Adicionar no `LLMProviderFactory`
3. Configurar variáveis de ambiente
4. Adicionar modelo em `LLM_MODELS`

### Adicionar Novo Modo de Análise
1. Adicionar enum em `AnalysisModeSchema`
2. Implementar instruções no `PromptBuilder`
3. Ajustar lógica no `ACEService` se necessário

### Adicionar Nova Métrica
1. Definir métrica no `utils/metrics.ts`
2. Instrumentar código
3. Exportar via `/metrics`
4. Criar dashboard Grafana

## Monitoramento e Alertas

### Métricas Críticas
- Error rate > 1%
- Latência P95 > 5s
- LLM failures > 5%
- Cache miss rate > 80%

### Logs Importantes
- LLM API errors
- Validation failures
- Authentication failures
- Timeouts

### SLOs Recomendados
- Availability: 99.9%
- Latency P95: < 5s
- Error Rate: < 0.1%

## Limitações Conhecidas

1. **Single-threaded**: Node.js é single-threaded
2. **LLM Latency**: Dependente de provider externo
3. **Token Limits**: Limitado por contexto do LLM
4. **Memory**: Payloads grandes consomem memória

## Roadmap

### Curto Prazo
- [ ] Cache Redis implementado
- [ ] OpenTelemetry tracing completo
- [ ] Testes unitários e integração

### Médio Prazo
- [ ] Suporte a Llama 3.1 self-hosted
- [ ] Streaming responses
- [ ] Batch processing
- [ ] WebSocket support

### Longo Prazo
- [ ] Fine-tuning de modelos
- [ ] Vector embeddings
- [ ] RAG (Retrieval Augmented Generation)
- [ ] Multi-modal analysis (images, PDFs)

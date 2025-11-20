# ACE - Augmented Context Engine

## Visão Geral

O **ACE (Augmented Context Engine)** é o componente cognitivo central da plataforma de IA Agentic, responsável por transformar dados brutos, estatísticos e analíticos em contexto semântico aumentado usando o padrão **CAG (Context Augmented Generation)**.

### Papel do ACE na Arquitetura

```
┌─────────────┐      ┌─────┐      ┌─────┐      ┌────────┐
│Orquestrador │─────>│ FSB │─────>│ ACE │─────>│ Worker │
└─────────────┘      └─────┘      └─────┘      └────────┘
      │                  │            │              │
   Coordena         Estatística   Semântica     Execução
```

## Características Principais

- **Stateless**: Não armazena dados, apenas processa e retorna inteligência
- **Multitenancy**: Suporte nativo a múltiplos tenants
- **Multi-LLM**: Integração com Gemini, OpenAI e Llama
- **Observabilidade**: Logs estruturados, métricas Prometheus e tracing OpenTelemetry
- **Performance**: Cache opcional com Redis, análise assíncrona
- **Segurança**: Autenticação JWT, rate limiting, validação rigorosa

## Loop CAG (Capture → Analyze → Generate)

1. **Capture**: Recebe dados do FSB, Analytics e metadados de negócio
2. **Analyze**: Correlaciona estatísticas, detecta anomalias, identifica drivers
3. **Generate**: Produz contexto semântico, insights e ações recomendadas

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## Endpoints Principais

### Health Check
```http
GET /sas-cag/v1/health
```

### Análise Semântica
```http
POST /sas-cag/v1/analyze
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>
Content-Type: application/json

{
  "request_id": "req-123",
  "use_case": "DRE_MARGIN_ANALYSIS",
  "mode": "mixed",
  "language": "pt-BR",
  "context": { ... },
  "fsb_features": { ... },
  "analytic_data": { ... }
}
```

### Listar Modelos
```http
GET /sas-cag/v1/models
```

### Métricas
```http
GET /sas-cag/v1/metrics
```

## Modos de Análise

- `semantic_summary`: Resumo semântico consolidado
- `root_cause`: Análise de causa raiz
- `anomaly_detection`: Detecção de anomalias
- `correlation_analysis`: Análise de correlações
- `recommendation`: Geração de recomendações
- `risk_scoring`: Scoring de risco
- `mixed`: Combinação inteligente de múltiplos modos

## Estrutura do Projeto

```
ace/
├── src/
│   ├── api/                 # Camada de API (rotas, controllers)
│   ├── core/                # Lógica principal do ACE
│   ├── providers/           # Integrações com LLMs
│   ├── services/            # Serviços de negócio
│   ├── middleware/          # Middlewares Express
│   ├── models/              # Schemas e tipos
│   ├── utils/               # Utilitários
│   ├── config/              # Configurações
│   └── index.ts             # Entry point
├── tests/                   # Testes
├── docs/                    # Documentação adicional
└── examples/                # Exemplos de uso
```

## Variáveis de Ambiente

Consulte [.env.example](.env.example) para lista completa de variáveis configuráveis.

## Integração com Orquestrador e Worker

### Fluxo Típico

1. **Orquestrador** coleta dados (FSB + Analytics + Metadados)
2. **Orquestrador** monta payload e chama `POST /v1/analyze`
3. **ACE** processa e retorna contexto semântico + insights + ações
4. **Orquestrador** interpreta resposta e decide próximos passos
5. **Worker** executa ações recomendadas

## Observabilidade

### Logs
- Formato JSON estruturado
- Níveis: ERROR, WARN, INFO, DEBUG
- Correlação via `request_id` e `trace_id`

### Métricas (Prometheus)
- `ace_requests_total`
- `ace_latency_ms`
- `ace_errors_total`
- `ace_llm_tokens_input_total`
- `ace_llm_tokens_output_total`

### Tracing (OpenTelemetry)
- Instrumentação automática
- Propagação de contexto distribuído

## Segurança

- Autenticação via JWT Bearer Token
- Rate limiting por tenant e use_case
- Validação rigorosa de payloads (Zod)
- Mascaramento de dados sensíveis em logs
- HTTPS/TLS obrigatório em produção

## Desenvolvimento

```bash
# Rodar em modo watch
npm run dev

# Testes
npm test

# Lint
npm run lint

# Format
npm run format
```

## Licença

MIT

## Time Responsável

Data&AI Platform Team

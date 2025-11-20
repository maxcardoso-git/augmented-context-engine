# ACE - Augmented Context Engine

## Resumo Executivo

O **ACE (Augmented Context Engine)** é o componente cognitivo central de uma plataforma de IA Agentic, responsável por transformar dados brutos e estatísticos em contexto semântico aumentado através do padrão **CAG (Context Augmented Generation)**.

### Estatísticas do Projeto

- **Linguagem**: TypeScript
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **LLMs**: Google Gemini, OpenAI GPT-4
- **Arquitetura**: Microservice REST API
- **Observabilidade**: Prometheus + Winston Logging
- **Validação**: Zod Schemas

## Estrutura do Projeto

```
ACE/
├── src/
│   ├── api/                      # Camada de API REST
│   │   ├── controllers/          # Controllers (health, analyze, models, metrics)
│   │   └── routes/               # Definição de rotas
│   ├── core/                     # Lógica de negócio principal
│   │   ├── statistical-analyzer.ts  # Análise estatística e anomalias
│   │   └── prompt-builder.ts        # Construção de prompts LLM
│   ├── services/                 # Serviços de negócio
│   │   └── ace.service.ts        # Serviço principal de análise
│   ├── providers/                # Integrações LLM
│   │   ├── gemini.provider.ts    # Provider Google Gemini
│   │   ├── openai.provider.ts    # Provider OpenAI
│   │   └── llm.factory.ts        # Factory de providers
│   ├── middleware/               # Middlewares Express
│   │   ├── auth.middleware.ts    # Autenticação JWT
│   │   ├── error.middleware.ts   # Tratamento de erros
│   │   └── validator.middleware.ts # Validação Zod
│   ├── models/                   # Schemas e tipos
│   │   ├── schemas.ts            # Schemas Zod completos
│   │   └── llm.ts                # Types de LLM
│   ├── utils/                    # Utilitários
│   │   ├── logger.ts             # Logger Winston
│   │   ├── metrics.ts            # Métricas Prometheus
│   │   └── helpers.ts            # Funções auxiliares
│   ├── config/                   # Configurações
│   │   └── index.ts              # Config centralizado
│   └── index.ts                  # Entry point
├── docs/                         # Documentação
│   ├── QUICKSTART.md             # Guia de início rápido
│   ├── API.md                    # Documentação da API
│   ├── INTEGRATION.md            # Guia de integração
│   ├── ARCHITECTURE.md           # Arquitetura detalhada
│   └── DEPLOYMENT.md             # Guia de deploy
├── examples/                     # Exemplos de uso
│   ├── request-example.json      # Payload de exemplo
│   └── curl-example.sh           # Script cURL
├── Dockerfile                    # Build Docker
├── docker-compose.yml            # Orquestração local
├── prometheus.yml                # Config Prometheus
├── package.json                  # Dependências
├── tsconfig.json                 # Config TypeScript
└── README.md                     # Documentação principal
```

## Componentes Principais

### 1. API Layer
- **Express Server** com middlewares de segurança (Helmet, CORS)
- **Autenticação** via Bearer Token (JWT)
- **Validação** rigorosa com Zod
- **Rate Limiting** por tenant
- **Multi-tenancy** via X-Tenant-Id header

### 2. Core Analysis
- **StatisticalAnalyzer**: Detecta anomalias (Z-score), calcula correlações (Pearson)
- **PromptBuilder**: Constrói prompts contextualizados em 3 idiomas (pt-BR, en-US, es-ES)
- **ACEService**: Orquestra o loop CAG completo

### 3. LLM Providers
- **Gemini Provider**: Integração com Google Gemini 1.5
- **OpenAI Provider**: Integração com GPT-4o/4o-mini/4-turbo
- **Factory Pattern**: Abstração e cache de providers

### 4. Observability
- **Winston Logger**: Logs estruturados JSON
- **Prometheus Metrics**: 15+ métricas de negócio e infraestrutura
- **OpenTelemetry Ready**: Tracing distribuído preparado

## Funcionalidades Principais

### Modos de Análise
1. **semantic_summary**: Resumo semântico consolidado
2. **root_cause**: Análise de causa raiz
3. **anomaly_detection**: Detecção de anomalias
4. **correlation_analysis**: Análise de correlações
5. **recommendation**: Geração de recomendações
6. **risk_scoring**: Scoring de risco
7. **mixed**: Combinação inteligente (recomendado)

### Capacidades Analíticas
- Detecção de anomalias via Z-score
- Cálculo de correlações entre variáveis
- Identificação de drivers de causa-efeito
- Geração de insights categorizados e priorizados
- Recomendação de ações com níveis de urgência
- Avaliação de riscos

### Idiomas Suportados
- Português (Brasil)
- Inglês (Estados Unidos)
- Espanhol (Espanha)

## Integrações

### Com Orquestrador
O Orquestrador coordena o fluxo:
1. Coleta dados do FSB e Analytics
2. Monta payload completo
3. Chama ACE via POST /v1/analyze
4. Interpreta resposta
5. Envia ações ao Worker

### Com FSB (Feature Statistical Builder)
Consome features estatísticas pré-processadas:
- Deltas percentuais
- Médias móveis
- Scores normalizados
- Indicadores derivados

### Com Worker
Fornece ações executáveis:
- Notificações
- Agendamento de revisões
- Ajustes de threshold
- Escalação de alertas
- Realocação de recursos

### Com Assistentes (Buddy, CFO, SiGAP)
Fornece contexto semântico para:
- Respostas conversacionais
- Relatórios executivos
- Dashboards inteligentes
- Alertas proativos

## Métricas e KPIs

### Performance
- **Latência P50**: < 2s (target)
- **Latência P95**: < 5s (target)
- **Throughput**: 100+ req/s com cache
- **Availability**: 99.9% (SLO)

### Negócio
- Total de análises processadas
- Insights gerados por categoria
- Anomalias detectadas por severidade
- Ações recomendadas por tipo
- Taxa de cache hit/miss

### Custos
- Tokens LLM consumidos (input/output)
- Custo estimado por análise
- Distribuição por provider

## Segurança

### Autenticação e Autorização
- JWT Bearer Token
- Scopes: `sas:analyze`, `sas:read-config`, `sas:metrics`
- Multi-tenancy isolado

### Proteção de Dados
- Mascaramento de dados sensíveis em logs
- Não persistência de PII
- HTTPS/TLS obrigatório em produção
- Validação rigorosa de inputs

### Rate Limiting
- 100 requests por minuto por tenant (configurável)
- Proteção contra DDoS
- Throttling por use_case

## Deployment

### Ambientes Suportados
- **Desenvolvimento**: npm run dev
- **Docker**: docker-compose up
- **Kubernetes**: Deployment + Service + HPA
- **Serverless**: Adaptável para Lambda/Cloud Functions

### Escalabilidade
- **Horizontal**: Stateless, permite múltiplas réplicas
- **Vertical**: Ajuste de heap Node.js
- **Auto-scaling**: HPA baseado em CPU/memória

### Monitoramento
- Prometheus para métricas
- Grafana para dashboards
- Winston para logs
- OpenTelemetry para tracing

## Quick Start

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.example .env
# Adicionar GEMINI_API_KEY ou OPENAI_API_KEY

# 3. Rodar
npm run dev

# 4. Testar
curl http://localhost:3000/health
```

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [README.md](README.md) | Visão geral e introdução |
| [QUICKSTART.md](docs/QUICKSTART.md) | Guia de início rápido (5 min) |
| [API.md](docs/API.md) | Documentação completa da API |
| [INTEGRATION.md](docs/INTEGRATION.md) | Como integrar com outros serviços |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura detalhada |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Guia de deploy produção |

## Tecnologias Utilizadas

### Core
- **Node.js** 20+ (runtime)
- **TypeScript** 5.6+ (linguagem)
- **Express.js** 4.21+ (framework web)

### LLM
- **Google Generative AI SDK** (Gemini)
- **OpenAI SDK** (GPT-4)

### Validação e Tipos
- **Zod** 3.23+ (schema validation)

### Observabilidade
- **Winston** 3.15+ (logging)
- **prom-client** 15+ (Prometheus metrics)
- **OpenTelemetry** (tracing - ready)

### Infraestrutura
- **Redis** 7+ (cache opcional)
- **Docker** (containerização)
- **Kubernetes** (orquestração)

## Próximos Passos

### Fase 1 (Atual)
- [x] API REST completa
- [x] Integração Gemini e OpenAI
- [x] Análise estatística básica
- [x] Logging e métricas
- [x] Documentação completa

### Fase 2 (Próximas semanas)
- [ ] Testes unitários e de integração
- [ ] Cache Redis implementado
- [ ] OpenTelemetry tracing completo
- [ ] CI/CD pipeline

### Fase 3 (Futuro)
- [ ] Suporte a Llama 3.1 self-hosted
- [ ] Streaming responses
- [ ] Vector embeddings
- [ ] RAG (Retrieval Augmented Generation)
- [ ] Multi-modal analysis

## Licença

MIT

## Time

**Data&AI Platform Team**

---

**Versão**: 1.0.0
**Última Atualização**: Novembro 2025
**Status**: Alpha - Ready for Testing

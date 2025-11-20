# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-11-20

### Adicionado

#### Core Features
- Serviço ACE completo com análise semântica (CAG)
- Integração com Google Gemini (1.5 Pro, 1.5 Flash)
- Integração com OpenAI (GPT-4o, GPT-4o-mini, GPT-4 Turbo)
- Análise estatística com detecção de anomalias (Z-score)
- Cálculo de correlações (Pearson)
- Suporte a 7 modos de análise: semantic_summary, root_cause, anomaly_detection, correlation_analysis, recommendation, risk_scoring, mixed
- Suporte a 3 idiomas: pt-BR, en-US, es-ES

#### API
- Endpoint `GET /health` - Health check
- Endpoint `POST /sas-cag/v1/analyze` - Análise principal
- Endpoint `GET /sas-cag/v1/models` - Listagem de modelos
- Endpoint `GET /sas-cag/v1/metrics` - Métricas Prometheus

#### Segurança
- Autenticação via Bearer Token (JWT)
- Multi-tenancy via X-Tenant-Id header
- Validação rigorosa com Zod schemas
- Mascaramento de dados sensíveis em logs
- Middleware de rate limiting preparado

#### Observabilidade
- Logging estruturado com Winston
- 15+ métricas Prometheus
- Correlation IDs para tracing
- Request/Response logging
- Error tracking

#### Infrastructure
- Dockerfile otimizado multi-stage
- Docker Compose com Redis, Prometheus e Grafana
- Configuração Kubernetes (deployment, service, HPA)
- Setup script automatizado
- Makefile com comandos úteis

#### Documentação
- README.md completo
- Quick Start Guide (5 minutos)
- API Documentation detalhada
- Integration Guide (Orquestrador, Worker)
- Architecture Documentation
- Deployment Guide (Docker, K8s, Serverless)
- Project Overview

#### Exemplos
- Request payload completo (DRE analysis)
- cURL examples
- Scripts de teste

### Tecnologias

- Node.js 20+
- TypeScript 5.6+
- Express.js 4.21+
- Zod 3.23+ (validation)
- Winston 3.15+ (logging)
- prom-client 15+ (metrics)
- Google Generative AI SDK
- OpenAI SDK

### Estrutura do Projeto

```
src/
├── api/          - Controllers e rotas
├── core/         - Lógica de análise
├── services/     - Serviços de negócio
├── providers/    - Integrações LLM
├── middleware/   - Express middlewares
├── models/       - Schemas e types
├── utils/        - Helpers, logger, metrics
└── config/       - Configurações
```

## [Unreleased]

### Planejado

#### Fase 2
- [ ] Testes unitários completos (Jest)
- [ ] Testes de integração
- [ ] Cache Redis implementado
- [ ] OpenTelemetry tracing distribuído
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Documentação de testes

#### Fase 3
- [ ] Suporte a Llama 3.1 (self-hosted)
- [ ] Streaming responses (Server-Sent Events)
- [ ] Batch processing
- [ ] WebSocket support
- [ ] Vector embeddings
- [ ] RAG (Retrieval Augmented Generation)
- [ ] Multi-modal analysis (images, PDFs)

---

## Versioning

Este projeto usa [Semantic Versioning](https://semver.org/):

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades mantendo compatibilidade
- **PATCH**: Correções de bugs

## Tipos de Mudanças

- **Adicionado**: Novas funcionalidades
- **Modificado**: Mudanças em funcionalidades existentes
- **Descontinuado**: Funcionalidades que serão removidas
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de vulnerabilidades

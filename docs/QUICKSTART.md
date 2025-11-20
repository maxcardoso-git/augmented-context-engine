# Quick Start - ACE

Este guia ajuda você a rodar o ACE em menos de 5 minutos.

## Pré-requisitos

- Node.js 20+
- npm 10+
- Chave de API do Gemini ou OpenAI

## Instalação Rápida

### 1. Clone e Instale

```bash
# Clone o repositório
cd ACE

# Instale dependências
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
# Copie o exemplo
cp .env.example .env

# Edite .env e adicione sua chave de API
# Escolha um dos dois:
GEMINI_API_KEY=your_gemini_key_here
# ou
OPENAI_API_KEY=your_openai_key_here
```

Configuração mínima do `.env`:

```env
NODE_ENV=development
PORT=3000

# Escolha um provider
GEMINI_API_KEY=AIza...
DEFAULT_LLM_PROVIDER=gemini
DEFAULT_LLM_MODEL=gemini-1.5-pro

# Segurança (pode deixar o padrão em dev)
JWT_SECRET=dev-secret-change-in-production
```

### 3. Rode em Modo Desenvolvimento

```bash
npm run dev
```

Você verá:

```
🚀 ACE Server iniciado
📊 Endpoints disponíveis:
  GET  /health
  GET  /sas-cag/v1/health
  GET  /sas-cag/v1/metrics
  GET  /sas-cag/v1/models
  POST /sas-cag/v1/analyze
```

### 4. Teste o Health Check

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2025-11-20T...",
  "version": "1.0.0",
  "uptime_seconds": 5,
  "service": "ace-cag",
  "environment": "development"
}
```

## Primeiro Request de Análise

### Usando cURL

```bash
curl -X POST http://localhost:3000/sas-cag/v1/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-token" \
  -H "X-Tenant-Id: test-tenant" \
  -d '{
    "request_id": "req-test-001",
    "use_case": "TEST_ANALYSIS",
    "mode": "mixed",
    "language": "pt-BR",
    "context": {
      "domain": "test"
    },
    "fsb_features": {
      "schema_version": "1.0.0",
      "features": {
        "metric_a": 100,
        "metric_b": 85,
        "metric_c": 120
      }
    },
    "prompt": "Analise estes dados e gere insights."
  }'
```

### Usando o Exemplo Fornecido

```bash
cd examples

# Dar permissão de execução
chmod +x curl-example.sh

# Executar
./curl-example.sh
```

### Resposta Esperada

```json
{
  "request_id": "req-test-001",
  "mode": "mixed",
  "semantic_context": "Análise dos dados mostra...",
  "key_highlights": [
    "Métrica C está 20% acima da média"
  ],
  "insights": [
    {
      "id": "insight-...",
      "title": "...",
      "description": "...",
      "category": "performance",
      "priority": "medium",
      "confidence": 0.85
    }
  ],
  "actions": [...],
  "meta": {
    "duration_ms": 2341,
    "llm_model_used": "gemini-1.5-pro",
    "llm_tokens_input": 234,
    "llm_tokens_output": 156
  }
}
```

## Testando com Dados Reais

Use o arquivo de exemplo completo:

```bash
curl -X POST http://localhost:3000/sas-cag/v1/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-token" \
  -H "X-Tenant-Id: cliente_x" \
  -d @examples/request-example.json
```

## Verificando Métricas

```bash
curl http://localhost:3000/sas-cag/v1/metrics
```

Você verá métricas Prometheus:

```
ace_requests_total{method="POST",endpoint="/v1/analyze"...} 1
ace_latency_ms_bucket{le="1000"...} 0
ace_llm_tokens_input_total{provider="gemini"...} 234
...
```

## Listar Modelos Disponíveis

```bash
curl -X GET http://localhost:3000/sas-cag/v1/models \
  -H "Authorization: Bearer dev-token"
```

Resposta:

```json
{
  "models": [
    {
      "name": "gemini-1.5-pro",
      "provider": "gemini",
      "default": true,
      "max_tokens": 8192,
      "context_window": 1000000,
      "status": "available"
    },
    ...
  ],
  "default_provider": "gemini",
  "default_model": "gemini-1.5-pro"
}
```

## Modos de Análise

Experimente diferentes modos mudando o campo `mode`:

### Resumo Semântico
```json
{
  "mode": "semantic_summary",
  ...
}
```

### Detecção de Anomalias
```json
{
  "mode": "anomaly_detection",
  ...
}
```

### Análise de Causa Raiz
```json
{
  "mode": "root_cause",
  ...
}
```

### Modo Misto (Recomendado)
```json
{
  "mode": "mixed",
  ...
}
```

## Testando com Docker

Se preferir usar Docker:

```bash
# Build
docker build -t ace:latest .

# Run
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e DEFAULT_LLM_PROVIDER=gemini \
  ace:latest
```

Ou com Docker Compose:

```bash
# Edite .env primeiro
docker-compose up -d

# Verificar logs
docker-compose logs -f ace

# Parar
docker-compose down
```

## Troubleshooting

### Erro: "GEMINI_API_KEY não configurada"

Certifique-se de ter adicionado a chave no `.env`:

```bash
GEMINI_API_KEY=AIza...
```

### Erro: "UNAUTHORIZED"

Adicione o header de autenticação:

```bash
-H "Authorization: Bearer dev-token"
```

Em produção, use um JWT real.

### Erro: "MISSING_TENANT_ID"

Adicione o header:

```bash
-H "X-Tenant-Id: test-tenant"
```

### Porta 3000 já em uso

Mude a porta no `.env`:

```bash
PORT=3001
```

## Próximos Passos

1. **Leia a [API Documentation](API.md)** - Entenda todos os endpoints
2. **Veja [Integration Guide](INTEGRATION.md)** - Integre com Orquestrador e Worker
3. **Configure [Deployment](DEPLOYMENT.md)** - Deploy em produção
4. **Estude [Architecture](ARCHITECTURE.md)** - Entenda a arquitetura interna

## Exemplos Adicionais

### Análise de DRE

Veja [examples/request-example.json](../examples/request-example.json) para um exemplo completo de análise de margem financeira.

### Análise de SLA

```json
{
  "use_case": "SLA_MONITORING",
  "mode": "risk_scoring",
  "fsb_features": {
    "features": {
      "sla_compliance": 0.92,
      "avg_response_time": 245,
      "incident_count": 12
    }
  },
  "prompt": "Avalie o risco de breach do SLA."
}
```

### Análise de Call Center

```json
{
  "use_case": "CALL_CENTER_PERFORMANCE",
  "mode": "mixed",
  "fsb_features": {
    "features": {
      "avg_tma": 320,
      "absenteeism_rate": 0.15,
      "customer_satisfaction": 0.87
    }
  },
  "prompt": "Analise a performance e identifique oportunidades de melhoria."
}
```

## Suporte

- **Issues**: [GitHub Issues](https://github.com/...)
- **Docs**: [/docs](/docs)
- **Examples**: [/examples](/examples)

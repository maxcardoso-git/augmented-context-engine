# ACE API Documentation

## Base URL

```
http://localhost:3000/sas-cag/v1
```

Em produção:
```
https://api.example.com/sas-cag/v1
```

## Autenticação

Todas as rotas protegidas requerem autenticação via Bearer Token:

```http
Authorization: Bearer <your-token>
```

## Headers Obrigatórios

### X-Tenant-Id
Identifica o tenant/cliente da requisição (obrigatório em modo multi-tenant):

```http
X-Tenant-Id: cliente_x
```

### X-Request-Id (Opcional)
Identificador de correlação da requisição. Se não fornecido, será gerado automaticamente:

```http
X-Request-Id: req-custom-id-123
```

## Endpoints

### 1. Health Check

Verifica se o serviço está disponível.

**Request:**
```http
GET /sas-cag/v1/health
```

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T10:00:00.000Z",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "service": "ace-cag",
  "environment": "development"
}
```

---

### 2. List Models

Lista os modelos LLM disponíveis.

**Request:**
```http
GET /sas-cag/v1/models
Authorization: Bearer <token>
```

**Response 200:**
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
    {
      "name": "gpt-4o",
      "provider": "openai",
      "default": false,
      "max_tokens": 4096,
      "context_window": 128000,
      "status": "available"
    }
  ],
  "default_provider": "gemini",
  "default_model": "gemini-1.5-pro"
}
```

---

### 3. Analyze (Principal)

Executa análise semântica (CAG).

**Request:**
```http
POST /sas-cag/v1/analyze
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "request_id": "req-123",
  "tenant_id": "cliente_x",
  "use_case": "DRE_MARGIN_ANALYSIS",
  "mode": "mixed",
  "language": "pt-BR",
  "time_window": {
    "from": "2025-11-01T00:00:00Z",
    "to": "2025-11-20T23:59:59Z",
    "granularity": "day"
  },
  "context": {
    "domain": "finance_dre",
    "operation_id": "op-12345",
    "business_metadata": {
      "client_id": "C123",
      "contract_id": "CTR-987"
    }
  },
  "fsb_features": {
    "schema_version": "1.0.0",
    "features": {
      "margin_delta_pct": -0.12,
      "revenue_delta_pct": -0.03,
      "cost_delta_pct": 0.09
    }
  },
  "analytic_data": {
    "schema_version": "1.0.0",
    "tables": [
      {
        "name": "dre_daily",
        "columns": [
          { "name": "date", "type": "date", "role": "TIMESTAMP" },
          { "name": "revenue", "type": "number", "role": "METRIC" },
          { "name": "margin", "type": "number", "role": "METRIC" }
        ],
        "rows": [
          { "date": "2025-11-15", "revenue": 100000, "margin": 20000 },
          { "date": "2025-11-16", "revenue": 95000, "margin": 14000 }
        ]
      }
    ]
  },
  "prompt": "Analise a variação de margem e identifique causas.",
  "constraints": {
    "max_tokens": 800,
    "max_insights": 5,
    "disable_llm": false
  }
}
```

**Response 200:**
```json
{
  "request_id": "req-123",
  "mode": "mixed",
  "semantic_context": "A margem apresentou queda de 12% no período...",
  "key_highlights": [
    "Margem em queda de 12%",
    "Custos aumentaram 9%",
    "Receita caiu apenas 3%"
  ],
  "drivers": [
    {
      "name": "aumento_custos",
      "direction": "negative",
      "impact_score": 0.85,
      "explanation": "Custos operacionais aumentaram..."
    }
  ],
  "anomalies": [
    {
      "id": "anomaly-xyz",
      "metric": "margin",
      "severity": "high",
      "anomaly_score": 0.78,
      "description": "Margem abaixo do esperado"
    }
  ],
  "insights": [
    {
      "id": "insight-abc",
      "title": "Pressão nos custos operacionais",
      "description": "Análise detalhada...",
      "category": "financial",
      "priority": "high",
      "confidence": 0.92
    }
  ],
  "actions": [
    {
      "id": "action-123",
      "label": "Revisar estrutura de custos",
      "description": "Ação recomendada...",
      "action_type": "schedule_review",
      "urgency": "high"
    }
  ],
  "meta": {
    "duration_ms": 2500,
    "llm_model_used": "gemini-1.5-pro",
    "llm_tokens_input": 1200,
    "llm_tokens_output": 450,
    "timestamp": "2025-11-20T10:05:00.000Z"
  }
}
```

---

### 4. Metrics (Prometheus)

Expõe métricas no formato Prometheus.

**Request:**
```http
GET /sas-cag/v1/metrics
```

**Response 200:**
```
# HELP ace_requests_total Total de requisições recebidas
# TYPE ace_requests_total counter
ace_requests_total{method="POST",endpoint="/v1/analyze",status_code="200",tenant_id="cliente_x"} 42

# HELP ace_latency_ms Latência das requisições em milissegundos
# TYPE ace_latency_ms histogram
...
```

---

## Códigos de Erro

### 400 - Bad Request
Erro de validação nos dados enviados.

```json
{
  "request_id": "req-123",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação nos dados enviados",
    "details": {
      "errors": [
        {
          "path": "mode",
          "message": "Invalid enum value"
        }
      ]
    },
    "retryable": false
  }
}
```

### 401 - Unauthorized
Token de autenticação inválido ou ausente.

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticação não fornecido",
    "retryable": false
  }
}
```

### 500 - Internal Server Error
Erro interno do servidor.

```json
{
  "request_id": "req-123",
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erro interno do servidor",
    "retryable": true
  }
}
```

### 504 - Gateway Timeout
Tempo limite excedido (ex: LLM demorou demais).

```json
{
  "request_id": "req-123",
  "error": {
    "code": "TIMEOUT",
    "message": "Tempo limite excedido",
    "retryable": true
  }
}
```

---

## Modos de Análise

- `semantic_summary`: Resumo semântico consolidado
- `root_cause`: Análise de causa raiz
- `anomaly_detection`: Detecção de anomalias
- `correlation_analysis`: Análise de correlações
- `recommendation`: Geração de recomendações
- `risk_scoring`: Scoring de risco
- `mixed`: Combinação inteligente (recomendado)

---

## Idiomas Suportados

- `pt-BR`: Português (Brasil)
- `en-US`: Inglês (EUA)
- `es-ES`: Espanhol (Espanha)

---

## Rate Limiting

O serviço implementa rate limiting por tenant:

- **Window**: 60 segundos
- **Max Requests**: 100 por window

Se excedido, retorna `429 Too Many Requests`.

# Guia de Integração ACE

## Visão Geral

O ACE (Augmented Context Engine) é projetado para ser integrado com três componentes principais:

1. **Orquestrador** - Coordena o fluxo e monta os payloads
2. **FSB (Feature Statistical Builder)** - Gera features estatísticas
3. **Worker** - Executa ações recomendadas

## Fluxo de Integração

```
┌─────────────┐
│Orquestrador │
└──────┬──────┘
       │
       │ 1. Coleta dados
       ↓
┌─────────────┐
│     FSB     │ → Features estatísticas
└──────┬──────┘
       │
       │ 2. Monta payload
       ↓
┌─────────────┐
│     ACE     │ → Análise semântica
└──────┬──────┘
       │
       │ 3. Retorna insights + ações
       ↓
┌─────────────┐
│Orquestrador │ → Decide próximos passos
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Worker    │ → Executa ações
└─────────────┘
```

## Integração via Orquestrador

### Passo 1: Coletar Dados

O Orquestrador deve coletar:

- Dados do FSB (features estatísticas)
- Dados analíticos (tabelas, métricas)
- Metadados de negócio
- Contexto do usuário

### Passo 2: Montar Payload

```typescript
const acePayload = {
  request_id: generateRequestId(),
  tenant_id: context.tenantId,
  use_case: "DRE_MARGIN_ANALYSIS",
  mode: "mixed",
  language: "pt-BR",

  // Dados do FSB
  fsb_features: {
    schema_version: "1.0.0",
    features: fsbOutput
  },

  // Dados analíticos
  analytic_data: {
    schema_version: "1.0.0",
    tables: analyticsData
  },

  // Contexto
  context: {
    domain: "finance_dre",
    operation_id: processId,
    business_metadata: {
      client_id: clientId,
      contract_id: contractId
    }
  },

  // Prompt específico
  prompt: "Analise a variação de margem...",

  // Constraints
  constraints: {
    max_tokens: 800,
    max_insights: 5
  }
};
```

### Passo 3: Chamar ACE

```typescript
const response = await fetch('http://ace-service:3000/sas-cag/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Id': tenantId,
    'X-Request-Id': requestId
  },
  body: JSON.stringify(acePayload)
});

const result = await response.json();
```

### Passo 4: Interpretar Resposta

```typescript
// Contexto semântico
const summary = result.semantic_context;

// Insights gerados
const insights = result.insights;
insights.forEach(insight => {
  if (insight.priority === 'critical' || insight.priority === 'high') {
    // Ação imediata
    sendAlert(insight);
  }
});

// Ações recomendadas
const actions = result.actions;
actions.forEach(action => {
  if (action.urgency === 'immediate') {
    // Enviar ao Worker
    workerQueue.push({
      action_id: action.id,
      action_type: action.action_type,
      target_system: action.target_system,
      parameters: extractParameters(action)
    });
  }
});

// Anomalias
const anomalies = result.anomalies;
anomalies.forEach(anomaly => {
  if (anomaly.severity === 'critical') {
    triggerIncident(anomaly);
  }
});
```

## Integração com Worker

O Worker recebe as ações recomendadas pelo ACE e as executa:

```typescript
// Worker recebe da fila
workerQueue.on('action', async (actionPayload) => {
  const { action_type, target_system, parameters } = actionPayload;

  switch (action_type) {
    case 'notification':
      await sendNotification(parameters);
      break;

    case 'schedule_review':
      await scheduleReview(parameters);
      break;

    case 'threshold_adjustment':
      await adjustThreshold(target_system, parameters);
      break;

    case 'alert_escalation':
      await escalateAlert(parameters);
      break;

    default:
      logger.warn(`Action type desconhecido: ${action_type}`);
  }
});
```

## Integração com Assistentes (Buddy, CFO, etc)

```typescript
// Buddy Assistant consome o contexto semântico do ACE
const buddyResponse = await generateResponse({
  userQuery: "Como está a margem hoje?",
  aceContext: result.semantic_context,
  insights: result.insights,
  highlights: result.key_highlights
});

// CFO Assistant usa drivers e análise de causa raiz
const cfoReport = generateExecutiveReport({
  period: timeWindow,
  semantic_summary: result.semantic_context,
  drivers: result.drivers,
  risks: result.risk,
  recommendations: result.actions.filter(a => a.urgency === 'high')
});
```

## Exemplo Completo (Node.js)

```typescript
import axios from 'axios';

class ACEClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async analyze(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await axios.post(
      `${this.baseUrl}/sas-cag/v1/analyze`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-Tenant-Id': payload.tenant_id,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data;
  }

  async listModels(): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/sas-cag/v1/models`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    return response.data;
  }
}

// Uso
const aceClient = new ACEClient('http://ace-service:3000', 'your-token');

const result = await aceClient.analyze({
  request_id: 'req-123',
  tenant_id: 'cliente_x',
  use_case: 'DRE_MARGIN_ANALYSIS',
  mode: 'mixed',
  language: 'pt-BR',
  context: { domain: 'finance' },
  prompt: 'Analise a margem',
  fsb_features: { ... },
  analytic_data: { ... }
});

console.log('Contexto:', result.semantic_context);
console.log('Insights:', result.insights.length);
console.log('Ações:', result.actions.length);
```

## Padrões de Retry

```typescript
async function callACEWithRetry(payload: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await aceClient.analyze(payload);
    } catch (error) {
      if (error.response?.data?.error?.retryable === false) {
        // Erro não retryable, falhar imediatamente
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await sleep(delay);
    }
  }
}
```

## Monitoramento e Observabilidade

### Logs Estruturados

Todos os logs do ACE incluem:
- `requestId`: Correlação de requisições
- `tenantId`: Identificação do tenant
- `useCase`: Caso de uso sendo executado
- `durationMs`: Duração da operação

### Métricas

Consumir métricas do ACE via Prometheus:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ace'
    static_configs:
      - targets: ['ace-service:3000']
    metrics_path: '/sas-cag/v1/metrics'
```

### Tracing Distribuído

O ACE suporta OpenTelemetry. Propagar trace context:

```typescript
const payload = {
  // ... outros campos
  trace: {
    trace_id: currentSpan.traceId,
    span_id: currentSpan.spanId,
    parent_span_id: currentSpan.parentSpanId
  }
};
```

## Segurança

### Autenticação

Sempre usar HTTPS em produção e incluir Bearer Token válido.

### Dados Sensíveis

Mascarar dados sensíveis antes de enviar ao ACE:

```typescript
function maskSensitiveFields(data: any): any {
  // Implementar lógica de mascaramento
  // Remover CPF, senhas, etc.
  return sanitizedData;
}
```

## Troubleshooting

### Erro 400 - Validation Error

Verificar schema do payload. Consultar [API.md](API.md).

### Erro 401 - Unauthorized

Verificar se token é válido e possui scope `sas:analyze`.

### Erro 504 - Timeout

Aumentar timeout do cliente ou reduzir `max_tokens` no payload.

### LLM retorna JSON inválido

O ACE possui fallback automático. Verificar logs para detalhes.

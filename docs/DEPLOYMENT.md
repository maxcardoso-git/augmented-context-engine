# Guia de Deploy - ACE

## Opções de Deploy

### 1. Docker Compose (Desenvolvimento/Staging)

**Requisitos:**
- Docker 20+
- Docker Compose 2+

**Passos:**

```bash
# 1. Clonar repositório
git clone <repo-url>
cd ACE

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas chaves de API

# 3. Subir serviços
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f ace

# 5. Testar health
curl http://localhost:3000/health
```

**Serviços incluídos:**
- ACE (porta 3000)
- Redis (porta 6379)
- Prometheus (porta 9090)
- Grafana (porta 3001)

---

### 2. Kubernetes (Produção)

**Requisitos:**
- Kubernetes 1.24+
- kubectl configurado
- Helm 3+ (opcional)

**Arquitetura recomendada:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ace-service
  namespace: ai-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ace
  template:
    metadata:
      labels:
        app: ace
    spec:
      containers:
      - name: ace
        image: your-registry/ace:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ace-secrets
              key: gemini-api-key
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ace-secrets
              key: openai-api-key
        - name: REDIS_HOST
          value: "redis-service"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ace-service
  namespace: ai-platform
spec:
  selector:
    app: ace
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ace-hpa
  namespace: ai-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ace-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Deploy:**

```bash
# 1. Criar namespace
kubectl create namespace ai-platform

# 2. Criar secrets
kubectl create secret generic ace-secrets \
  --from-literal=gemini-api-key=YOUR_KEY \
  --from-literal=openai-api-key=YOUR_KEY \
  --from-literal=jwt-secret=YOUR_SECRET \
  -n ai-platform

# 3. Aplicar manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# 4. Verificar status
kubectl get pods -n ai-platform
kubectl logs -f deployment/ace-service -n ai-platform
```

---

### 3. Serverless (AWS Lambda + API Gateway)

Para deploy serverless, adaptar o código usando frameworks como:
- **Serverless Framework**
- **AWS SAM**
- **Google Cloud Functions**

Considerações:
- LLMs podem causar cold start longo
- Configurar timeout adequado (30s+)
- Usar camadas para dependências

---

## Variáveis de Ambiente (Produção)

### Obrigatórias

```bash
NODE_ENV=production
PORT=3000

# LLM
GEMINI_API_KEY=<sua-chave>
# ou
OPENAI_API_KEY=<sua-chave>

DEFAULT_LLM_PROVIDER=gemini
DEFAULT_LLM_MODEL=gemini-1.5-pro

# Security
JWT_SECRET=<secret-forte-aqui>
```

### Opcionais

```bash
# Redis
REDIS_ENABLED=true
REDIS_HOST=redis-service
REDIS_PORT=6379
REDIS_PASSWORD=<senha>

# Observability
LOG_LEVEL=info
METRICS_ENABLED=true
TRACING_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318

# Rate Limiting
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX_REQUESTS=100
```

---

## Segurança em Produção

### 1. HTTPS/TLS

Sempre usar HTTPS. Configurar certificados via:
- Load Balancer (AWS ALB, GCP LB)
- Ingress Controller (Nginx, Traefik)
- Certificados Let's Encrypt

### 2. Autenticação

Implementar JWT real com validação:

```typescript
import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

### 3. Rate Limiting

Usar Redis para rate limiting distribuído:

```bash
npm install express-rate-limit rate-limit-redis
```

### 4. Secrets Management

Usar serviços de secrets:
- AWS Secrets Manager
- Google Secret Manager
- HashiCorp Vault
- Kubernetes Secrets

---

## Monitoramento

### Prometheus + Grafana

**Dashboard Grafana recomendado:**

Métricas principais:
- Request rate (req/s)
- Latência (p50, p95, p99)
- Error rate
- LLM tokens consumidos
- Cache hit rate

**Alertas recomendados:**

```yaml
groups:
  - name: ace_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(ace_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alta taxa de erros no ACE"

      - alert: HighLatency
        expr: histogram_quantile(0.95, ace_latency_ms) > 5000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Latência p95 > 5s"

      - alert: LLMTokensExhausted
        expr: rate(ace_llm_tokens_input_total[1h]) > 1000000
        for: 10m
        labels:
          severity: info
        annotations:
          summary: "Alto consumo de tokens LLM"
```

---

## Logs Centralizados

### ELK Stack

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /app/logs/*.log
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
```

### CloudWatch / Stackdriver

Configurar agente de logs do provider cloud.

---

## Backup e Disaster Recovery

### Redis

Configurar snapshots automáticos:

```bash
# redis.conf
save 900 1
save 300 10
save 60 10000
```

### Código

- Git tags para releases
- CI/CD com rollback automático
- Blue/Green deployment

---

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Secrets em vault seguro
- [ ] HTTPS/TLS configurado
- [ ] Rate limiting habilitado
- [ ] Monitoramento configurado (Prometheus)
- [ ] Logs centralizados
- [ ] Alertas configurados
- [ ] HPA configurado (K8s)
- [ ] Health checks funcionando
- [ ] Redis backup configurado
- [ ] Documentação de API publicada
- [ ] Testes de carga realizados
- [ ] Plano de rollback definido

---

## Performance Tuning

### Node.js

```bash
# Aumentar heap size
NODE_OPTIONS="--max-old-space-size=4096"
```

### Redis

```bash
# Aumentar max connections
maxclients 10000
```

### LLM

- Usar modelos menores para casos simples (gemini-1.5-flash)
- Implementar cache agressivo
- Configurar timeouts adequados

---

## Troubleshooting

### Logs

```bash
# Docker
docker-compose logs -f ace

# Kubernetes
kubectl logs -f deployment/ace-service -n ai-platform

# Seguir logs específicos
kubectl logs -f <pod-name> -n ai-platform
```

### Métricas

```bash
# Prometheus
curl http://localhost:9090/api/v1/query?query=ace_requests_total

# Grafana
http://localhost:3001
```

### Debug Mode

```bash
LOG_LEVEL=debug npm run dev
```

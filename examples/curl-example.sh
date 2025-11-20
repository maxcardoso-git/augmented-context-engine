#!/bin/bash

# Exemplo de chamada ao ACE via cURL

# Configurações
ACE_URL="http://localhost:3000/sas-cag/v1"
BEARER_TOKEN="your-token-here"
TENANT_ID="cliente_x"

# Health Check
echo "=== Health Check ==="
curl -X GET "${ACE_URL}/health"
echo -e "\n\n"

# List Models
echo "=== List Models ==="
curl -X GET "${ACE_URL}/models" \
  -H "Authorization: Bearer ${BEARER_TOKEN}"
echo -e "\n\n"

# Analyze - POST
echo "=== Analyze ==="
curl -X POST "${ACE_URL}/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d @request-example.json
echo -e "\n\n"

# Metrics
echo "=== Metrics ==="
curl -X GET "${ACE_URL}/metrics"
echo -e "\n\n"

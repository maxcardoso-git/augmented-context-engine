#!/bin/bash

# deploy.sh - Script de deploy automático para ACE
# Executa localmente após fazer commit

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do ACE para o servidor..."

# Verificar se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Você tem mudanças não commitadas. Por favor, commit antes de fazer deploy."
    echo ""
    git status -s
    exit 1
fi

# Fazer push para o Git
echo "📤 Enviando código para o repositório..."
git push origin main

# SSH no servidor e atualizar
echo "🔗 Conectando ao servidor..."
ssh root@72.61.52.70 << 'ENDSSH'
    set -e

    cd /var/www/ACE

    echo "📥 Baixando últimas mudanças..."
    git pull origin main

    echo "📦 Instalando dependências..."
    npm install

    echo "🔨 Compilando TypeScript..."
    npm run build

    echo "🔄 Reiniciando serviço ACE..."
    pm2 restart ace-service || pm2 start ecosystem.config.cjs

    echo "✅ Deploy do ACE completed!"

    # Mostrar status dos serviços
    echo ""
    echo "📊 Status dos serviços:"
    pm2 status
ENDSSH

echo ""
echo "🎉 Deploy do ACE finalizado com sucesso!"
echo "📱 Serviço disponível em:"
echo "   API: http://72.61.52.70:8001"
echo "   Health: http://72.61.52.70:8001/sas-cag/v1/health"
echo ""

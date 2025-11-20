#!/bin/bash

set -e

echo "================================================"
echo "  ACE - Augmented Context Engine Setup"
echo "================================================"
echo ""

# Verificar Node.js
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 20+ primeiro."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js versão 20+ necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar npm
echo "Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado."
    exit 1
fi

echo "✅ npm $(npm -v) encontrado"
echo ""

# Instalar dependências
echo "Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"
echo ""

# Configurar .env
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e adicione suas chaves de API:"
    echo "   - GEMINI_API_KEY ou OPENAI_API_KEY"
    echo ""
else
    echo "✅ Arquivo .env já existe"
fi

# Criar diretórios necessários
echo "Criando diretórios..."
mkdir -p logs
mkdir -p dist

echo "✅ Diretórios criados"
echo ""

# Verificar chaves de API
echo "Verificando configuração..."

if [ -f .env ]; then
    source .env

    if [ -z "$GEMINI_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  Nenhuma chave de API configurada em .env"
        echo "   Configure GEMINI_API_KEY ou OPENAI_API_KEY antes de iniciar"
    else
        if [ -n "$GEMINI_API_KEY" ]; then
            echo "✅ GEMINI_API_KEY configurada"
        fi
        if [ -n "$OPENAI_API_KEY" ]; then
            echo "✅ OPENAI_API_KEY configurada"
        fi
    fi
fi

echo ""
echo "================================================"
echo "  Setup concluído!"
echo "================================================"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Edite .env e configure suas chaves de API:"
echo "   nano .env"
echo ""
echo "2. Inicie o servidor em modo desenvolvimento:"
echo "   npm run dev"
echo ""
echo "3. Ou faça o build para produção:"
echo "   npm run build"
echo "   npm start"
echo ""
echo "4. Ou use Docker:"
echo "   docker-compose up -d"
echo ""
echo "Documentação:"
echo "  - Quick Start: docs/QUICKSTART.md"
echo "  - API Docs: docs/API.md"
echo "  - Integration: docs/INTEGRATION.md"
echo ""
echo "Testes:"
echo "  curl http://localhost:3000/health"
echo ""
echo "================================================"

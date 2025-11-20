.PHONY: help install dev build start test lint format clean docker-build docker-up docker-down docker-logs setup

help: ## Mostra esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Executa setup inicial do projeto
	@./setup.sh

install: ## Instala dependências
	@echo "Instalando dependências..."
	@npm install

dev: ## Inicia servidor em modo desenvolvimento
	@echo "Iniciando servidor em modo desenvolvimento..."
	@npm run dev

build: ## Compila o projeto
	@echo "Compilando projeto..."
	@npm run build

start: ## Inicia servidor em modo produção
	@echo "Iniciando servidor..."
	@npm start

test: ## Executa testes
	@echo "Executando testes..."
	@npm test

test-watch: ## Executa testes em modo watch
	@echo "Executando testes em modo watch..."
	@npm run test:watch

lint: ## Executa linter
	@echo "Executando linter..."
	@npm run lint

format: ## Formata código
	@echo "Formatando código..."
	@npm run format

clean: ## Remove arquivos gerados
	@echo "Limpando arquivos gerados..."
	@rm -rf dist
	@rm -rf coverage
	@rm -rf node_modules
	@rm -rf logs/*.log
	@echo "✅ Arquivos limpos"

docker-build: ## Faz build da imagem Docker
	@echo "Building Docker image..."
	@docker build -t ace:latest .

docker-up: ## Sobe containers Docker
	@echo "Subindo containers..."
	@docker-compose up -d

docker-down: ## Para containers Docker
	@echo "Parando containers..."
	@docker-compose down

docker-logs: ## Mostra logs dos containers
	@docker-compose logs -f ace

docker-restart: docker-down docker-up ## Reinicia containers

health: ## Verifica health do serviço
	@curl -s http://localhost:3000/health | jq '.'

models: ## Lista modelos disponíveis
	@curl -s http://localhost:3000/sas-cag/v1/models \
		-H "Authorization: Bearer dev-token" | jq '.'

metrics: ## Mostra métricas
	@curl -s http://localhost:3000/sas-cag/v1/metrics

test-api: ## Testa endpoint de análise
	@curl -X POST http://localhost:3000/sas-cag/v1/analyze \
		-H "Content-Type: application/json" \
		-H "Authorization: Bearer dev-token" \
		-H "X-Tenant-Id: test" \
		-d @examples/request-example.json | jq '.'

k8s-deploy: ## Deploy no Kubernetes
	@echo "Deploying to Kubernetes..."
	@kubectl apply -f k8s/

k8s-delete: ## Remove do Kubernetes
	@echo "Removing from Kubernetes..."
	@kubectl delete -f k8s/

logs: ## Mostra logs locais
	@tail -f logs/combined.log

ps: ## Mostra processos Node.js
	@ps aux | grep node | grep -v grep

default: help

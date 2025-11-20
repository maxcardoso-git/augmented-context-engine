# Guia de Contribuição

Obrigado por considerar contribuir com o ACE (Augmented Context Engine)!

## Como Contribuir

### Reportando Bugs

Se você encontrar um bug:

1. Verifique se já não existe uma issue aberta
2. Abra uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Versão do Node.js, SO, etc
   - Logs relevantes (mascarando dados sensíveis)

### Sugerindo Melhorias

Para sugerir novas funcionalidades:

1. Abra uma issue com tag `enhancement`
2. Descreva o caso de uso
3. Explique por que seria útil
4. Proponha uma implementação (opcional)

### Pull Requests

1. **Fork** o repositório
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. **Faça suas mudanças** seguindo o guia de estilo
4. **Adicione testes** se aplicável
5. **Atualize a documentação** se necessário
6. **Commit** suas mudanças:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```
7. **Push** para sua branch:
   ```bash
   git push origin feature/minha-feature
   ```
8. **Abra um Pull Request**

## Guia de Estilo

### Código TypeScript

- Use TypeScript estrito
- Siga o ESLint configurado
- Use Prettier para formatação
- Prefira `const` sobre `let`
- Evite `any`, use tipos específicos

**Exemplo:**

```typescript
// ❌ Ruim
function process(data: any) {
  let result = data.value;
  return result;
}

// ✅ Bom
function process(data: { value: number }): number {
  const result = data.value;
  return result;
}
```

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, sem mudança de código
- `refactor:` Refatoração sem adicionar feature ou corrigir bug
- `perf:` Melhoria de performance
- `test:` Adicionar ou corrigir testes
- `chore:` Mudanças em build, CI, etc

**Exemplos:**

```
feat: adiciona suporte a Llama 3.1
fix: corrige detecção de anomalias em datasets pequenos
docs: atualiza guia de integração
refactor: extrai lógica de prompt para builder
```

### Nomenclatura

- **Arquivos**: kebab-case (`statistical-analyzer.ts`)
- **Classes**: PascalCase (`StatisticalAnalyzer`)
- **Funções/variáveis**: camelCase (`analyzeData`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase com `I` prefix opcional (`ILLMProvider` ou `LLMProvider`)

### Estrutura de Código

```typescript
// 1. Imports
import { Type } from 'library';

// 2. Types/Interfaces
interface MyInterface {
  field: string;
}

// 3. Constants
const MAX_SIZE = 100;

// 4. Main class/function
export class MyClass {
  // 4.1. Properties
  private field: string;

  // 4.2. Constructor
  constructor(field: string) {
    this.field = field;
  }

  // 4.3. Public methods
  public process(): void {
    // ...
  }

  // 4.4. Private methods
  private helper(): void {
    // ...
  }
}
```

## Testes

### Escrevendo Testes

```typescript
import { StatisticalAnalyzer } from './statistical-analyzer';

describe('StatisticalAnalyzer', () => {
  let analyzer: StatisticalAnalyzer;

  beforeEach(() => {
    analyzer = new StatisticalAnalyzer();
  });

  describe('analyze', () => {
    it('deve detectar anomalias em dados válidos', () => {
      const data = { features: { metric_a: 100 } };
      const result = analyzer.analyze(data);

      expect(result.anomalies).toBeDefined();
    });

    it('deve retornar array vazio para dados sem anomalias', () => {
      const data = { features: { metric_a: 50 } };
      const result = analyzer.analyze(data);

      expect(result.anomalies).toHaveLength(0);
    });
  });
});
```

### Rodando Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com coverage
npm test -- --coverage
```

## Documentação

### JSDoc

Use JSDoc para funções públicas:

```typescript
/**
 * Analisa dados estatísticos e detecta anomalias
 *
 * @param data - Dados de entrada com features
 * @param threshold - Limite de Z-score para anomalias (padrão: 2.5)
 * @returns Resultado contendo anomalias e correlações
 *
 * @example
 * ```typescript
 * const result = analyzer.analyze(
 *   { features: { metric_a: 100 } },
 *   3.0
 * );
 * ```
 */
analyze(data: FSBFeatures, threshold: number = 2.5): AnalysisResult {
  // ...
}
```

### README

Ao adicionar nova funcionalidade, atualize:
- README.md principal
- Documentação em `/docs` se relevante
- Exemplos em `/examples` se aplicável

## Processo de Review

### O que procuramos

- ✅ Código limpo e legível
- ✅ Testes adequados
- ✅ Documentação atualizada
- ✅ Sem breaking changes (ou documentados)
- ✅ Performance considerada
- ✅ Segurança verificada

### Timeline

- Revisões iniciais: 1-2 dias úteis
- Feedback detalhado: até 1 semana
- Aprovação final: após todos os comentários resolvidos

## Configuração de Desenvolvimento

### Primeira vez

```bash
# 1. Fork e clone
git clone https://github.com/seu-usuario/ACE.git
cd ACE

# 2. Setup
./setup.sh

# 3. Configure .env
cp .env.example .env
# Adicione suas API keys

# 4. Instale dependências
npm install

# 5. Rode em dev
npm run dev
```

### Ferramentas Úteis

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npx tsc --noEmit

# Build
npm run build
```

## Boas Práticas

### Segurança

- ❌ Nunca commitar secrets, API keys, senhas
- ✅ Use `.env` para configurações sensíveis
- ✅ Mascare dados sensíveis em logs
- ✅ Valide todos os inputs

### Performance

- ✅ Use async/await para I/O
- ✅ Evite loops desnecessários
- ✅ Cache quando apropriado
- ✅ Monitore uso de memória

### Logging

```typescript
// ❌ Ruim
console.log('Processing data...');

// ✅ Bom
logger.info('Processing data', {
  requestId,
  dataSize: data.length
});
```

## Questões?

- Abra uma issue com tag `question`
- Consulte a [documentação](docs/)
- Revise [issues existentes](https://github.com/.../issues)

## Código de Conduta

Este projeto adere a um código de conduta. Ao participar, espera-se que você o respeite.

Seja:
- ✅ Respeitoso e inclusivo
- ✅ Construtivo em feedback
- ✅ Profissional em discussões

Evite:
- ❌ Linguagem ofensiva
- ❌ Ataques pessoais
- ❌ Assédio de qualquer tipo

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença MIT.

---

**Obrigado por contribuir! 🚀**

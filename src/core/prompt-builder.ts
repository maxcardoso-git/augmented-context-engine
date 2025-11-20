import {
  AnalyzeRequest,
  AnalysisMode,
  Language,
  FSBFeatures,
  AnalyticData,
  Context
} from '../models/schemas';
import { StatisticalAnalysisResult } from './statistical-analyzer';

export class PromptBuilder {
  /**
   * Constrói o prompt system para o LLM
   */
  buildSystemPrompt(mode: AnalysisMode, language: Language): string {
    const basePrompt = this.getBaseSystemPrompt(language);
    const modeInstructions = this.getModeInstructions(mode, language);

    return `${basePrompt}\n\n${modeInstructions}`;
  }

  /**
   * Constrói o prompt principal com todos os dados
   */
  buildAnalysisPrompt(
    request: AnalyzeRequest,
    statisticalAnalysis: StatisticalAnalysisResult
  ): string {
    const sections: string[] = [];

    // 1. Contexto e objetivo
    sections.push(this.buildContextSection(request, request.language));

    // 2. Features estatísticas
    if (request.fsb_features) {
      sections.push(this.buildFSBSection(request.fsb_features, request.language));
    }

    // 3. Dados analíticos
    if (request.analytic_data) {
      sections.push(this.buildAnalyticDataSection(request.analytic_data, request.language));
    }

    // 4. Análise estatística
    sections.push(this.buildStatisticalSection(statisticalAnalysis, request.language));

    // 5. Documentos complementares
    if (request.raw_documents && request.raw_documents.length > 0) {
      sections.push(this.buildDocumentsSection(request.raw_documents, request.language));
    }

    // 6. Instrução específica
    sections.push(this.buildInstructionSection(request, request.language));

    return sections.join('\n\n---\n\n');
  }

  private getBaseSystemPrompt(language: Language): string {
    const prompts = {
      'pt-BR': `Você é um analista especialista em análise semântica de dados, parte do ACE (Augmented Context Engine).

Suas responsabilidades:
- Interpretar dados estatísticos e analíticos complexos
- Identificar padrões, tendências e anomalias
- Correlacionar múltiplas variáveis e identificar drivers de causa-efeito
- Gerar insights acionáveis e recomendações práticas
- Explicar fenômenos complexos em linguagem clara e objetiva
- Fornecer contexto semântico aumentado para suportar decisões inteligentes

Princípios:
- Sempre baseie suas análises nos dados fornecidos
- Seja preciso, conciso e objetivo
- Identifique causa raiz, não apenas sintomas
- Priorize insights de alto impacto
- Forneça recomendações específicas e acionáveis
- Use linguagem clara, evitando jargões desnecessários`,

      'en-US': `You are a data semantic analysis expert, part of ACE (Augmented Context Engine).

Your responsibilities:
- Interpret complex statistical and analytical data
- Identify patterns, trends, and anomalies
- Correlate multiple variables and identify cause-effect drivers
- Generate actionable insights and practical recommendations
- Explain complex phenomena in clear, objective language
- Provide augmented semantic context to support intelligent decisions

Principles:
- Always base your analysis on provided data
- Be precise, concise, and objective
- Identify root cause, not just symptoms
- Prioritize high-impact insights
- Provide specific, actionable recommendations
- Use clear language, avoiding unnecessary jargon`,

      'es-ES': `Eres un analista experto en análisis semántico de datos, parte de ACE (Augmented Context Engine).

Tus responsabilidades:
- Interpretar datos estadísticos y analíticos complejos
- Identificar patrones, tendencias y anomalías
- Correlacionar múltiples variables e identificar impulsores de causa-efecto
- Generar insights accionables y recomendaciones prácticas
- Explicar fenómenos complejos en lenguaje claro y objetivo
- Proporcionar contexto semántico aumentado para apoyar decisiones inteligentes

Principios:
- Siempre basa tu análisis en los datos proporcionados
- Sé preciso, conciso y objetivo
- Identifica la causa raíz, no solo los síntomas
- Prioriza insights de alto impacto
- Proporciona recomendaciones específicas y accionables
- Usa lenguaje claro, evitando jergas innecesarias`
    };

    return prompts[language];
  }

  private getModeInstructions(mode: AnalysisMode, language: Language): string {
    const instructions = {
      'pt-BR': {
        semantic_summary: 'Foco: Gerar um resumo semântico consolidado dos dados, destacando pontos principais.',
        root_cause: 'Foco: Identificar causas raiz de problemas ou variações detectadas nos dados.',
        anomaly_detection: 'Foco: Detectar e explicar anomalias, outliers e comportamentos atípicos.',
        correlation_analysis: 'Foco: Analisar correlações entre variáveis e explicar relações causais.',
        recommendation: 'Foco: Gerar recomendações práticas e acionáveis baseadas na análise.',
        risk_scoring: 'Foco: Avaliar riscos e pontuar níveis de criticidade de diferentes fatores.',
        mixed: 'Foco: Análise abrangente combinando múltiplas técnicas (resumo, causas, anomalias, correlações e recomendações).'
      },
      'en-US': {
        semantic_summary: 'Focus: Generate a consolidated semantic summary of the data, highlighting key points.',
        root_cause: 'Focus: Identify root causes of problems or detected variations in the data.',
        anomaly_detection: 'Focus: Detect and explain anomalies, outliers, and atypical behaviors.',
        correlation_analysis: 'Focus: Analyze correlations between variables and explain causal relationships.',
        recommendation: 'Focus: Generate practical, actionable recommendations based on analysis.',
        risk_scoring: 'Focus: Assess risks and score criticality levels of different factors.',
        mixed: 'Focus: Comprehensive analysis combining multiple techniques (summary, causes, anomalies, correlations, and recommendations).'
      },
      'es-ES': {
        semantic_summary: 'Enfoque: Generar un resumen semántico consolidado de los datos, destacando puntos clave.',
        root_cause: 'Enfoque: Identificar causas raíz de problemas o variaciones detectadas en los datos.',
        anomaly_detection: 'Enfoque: Detectar y explicar anomalías, valores atípicos y comportamientos anormales.',
        correlation_analysis: 'Enfoque: Analizar correlaciones entre variables y explicar relaciones causales.',
        recommendation: 'Enfoque: Generar recomendaciones prácticas y accionables basadas en el análisis.',
        risk_scoring: 'Enfoque: Evaluar riesgos y puntuar niveles de criticidad de diferentes factores.',
        mixed: 'Enfoque: Análisis integral que combina múltiples técnicas (resumen, causas, anomalías, correlaciones y recomendaciones).'
      }
    };

    return instructions[language][mode];
  }

  private buildContextSection(request: AnalyzeRequest, language: Language): string {
    const titles = {
      'pt-BR': '## CONTEXTO DA ANÁLISE',
      'en-US': '## ANALYSIS CONTEXT',
      'es-ES': '## CONTEXTO DEL ANÁLISIS'
    };

    let section = `${titles[language]}\n\n`;
    section += `Use Case: ${request.use_case}\n`;
    section += `Domain: ${request.context.domain}\n`;

    if (request.context.business_metadata) {
      section += `\nBusiness Metadata:\n`;
      section += JSON.stringify(request.context.business_metadata, null, 2);
    }

    return section;
  }

  private buildFSBSection(features: FSBFeatures, language: Language): string {
    const titles = {
      'pt-BR': '## FEATURES ESTATÍSTICAS (FSB)',
      'en-US': '## STATISTICAL FEATURES (FSB)',
      'es-ES': '## CARACTERÍSTICAS ESTADÍSTICAS (FSB)'
    };

    let section = `${titles[language]}\n\n`;
    section += JSON.stringify(features.features, null, 2);

    return section;
  }

  private buildAnalyticDataSection(data: AnalyticData, language: Language): string {
    const titles = {
      'pt-BR': '## DADOS ANALÍTICOS',
      'en-US': '## ANALYTICAL DATA',
      'es-ES': '## DATOS ANALÍTICOS'
    };

    let section = `${titles[language]}\n\n`;

    for (const table of data.tables) {
      section += `### ${table.name}\n\n`;
      section += `Columns: ${table.columns.map(c => `${c.name} (${c.type})`).join(', ')}\n\n`;

      // Mostrar primeiras linhas
      const maxRows = 10;
      const rowsToShow = table.rows.slice(0, maxRows);
      section += JSON.stringify(rowsToShow, null, 2);

      if (table.rows.length > maxRows) {
        section += `\n\n... (${table.rows.length - maxRows} more rows)\n`;
      }

      section += '\n\n';
    }

    return section;
  }

  private buildStatisticalSection(
    analysis: StatisticalAnalysisResult,
    language: Language
  ): string {
    const titles = {
      'pt-BR': '## ANÁLISE ESTATÍSTICA',
      'en-US': '## STATISTICAL ANALYSIS',
      'es-ES': '## ANÁLISIS ESTADÍSTICO'
    };

    let section = `${titles[language]}\n\n`;

    if (analysis.anomalies.length > 0) {
      section += `### Anomalies Detected: ${analysis.anomalies.length}\n\n`;
      section += JSON.stringify(analysis.anomalies, null, 2);
      section += '\n\n';
    }

    if (analysis.correlations.length > 0) {
      section += `### Correlations Found: ${analysis.correlations.length}\n\n`;
      section += JSON.stringify(analysis.correlations, null, 2);
      section += '\n\n';
    }

    if (Object.keys(analysis.statistics).length > 0) {
      section += `### Statistics Summary:\n\n`;
      section += JSON.stringify(analysis.statistics, null, 2);
    }

    return section;
  }

  private buildDocumentsSection(documents: any[], language: Language): string {
    const titles = {
      'pt-BR': '## DOCUMENTOS COMPLEMENTARES',
      'en-US': '## COMPLEMENTARY DOCUMENTS',
      'es-ES': '## DOCUMENTOS COMPLEMENTARIOS'
    };

    let section = `${titles[language]}\n\n`;

    for (const doc of documents) {
      section += `### ${doc.type} (${doc.doc_id})\n\n`;
      section += `${doc.content}\n\n`;
    }

    return section;
  }

  private buildInstructionSection(request: AnalyzeRequest, language: Language): string {
    const titles = {
      'pt-BR': '## INSTRUÇÃO',
      'en-US': '## INSTRUCTION',
      'es-ES': '## INSTRUCCIÓN'
    };

    let section = `${titles[language]}\n\n`;
    section += request.prompt;

    section += '\n\n';

    const outputInstructions = {
      'pt-BR': `**IMPORTANTE**: Sua resposta deve ser um JSON válido seguindo esta estrutura:

{
  "semantic_context": "string - resumo semântico em linguagem natural",
  "key_highlights": ["array de strings com principais destaques"],
  "drivers": [{"name": "string", "direction": "positive|negative|neutral", "impact_score": number, "explanation": "string"}],
  "insights": [{"title": "string", "description": "string", "category": "string", "priority": "low|medium|high|critical", "confidence": number}],
  "actions": [{"label": "string", "description": "string", "action_type": "string", "urgency": "low|medium|high|immediate"}]
}`,

      'en-US': `**IMPORTANT**: Your response must be valid JSON following this structure:

{
  "semantic_context": "string - semantic summary in natural language",
  "key_highlights": ["array of strings with key highlights"],
  "drivers": [{"name": "string", "direction": "positive|negative|neutral", "impact_score": number, "explanation": "string"}],
  "insights": [{"title": "string", "description": "string", "category": "string", "priority": "low|medium|high|critical", "confidence": number}],
  "actions": [{"label": "string", "description": "string", "action_type": "string", "urgency": "low|medium|high|immediate"}]
}`,

      'es-ES': `**IMPORTANTE**: Tu respuesta debe ser un JSON válido siguiendo esta estructura:

{
  "semantic_context": "string - resumen semántico en lenguaje natural",
  "key_highlights": ["array de strings con puntos destacados"],
  "drivers": [{"name": "string", "direction": "positive|negative|neutral", "impact_score": number, "explanation": "string"}],
  "insights": [{"title": "string", "description": "string", "category": "string", "priority": "low|medium|high|critical", "confidence": number}],
  "actions": [{"label": "string", "description": "string", "action_type": "string", "urgency": "low|medium|high|immediate"}]
}`
    };

    section += outputInstructions[language];

    return section;
  }
}

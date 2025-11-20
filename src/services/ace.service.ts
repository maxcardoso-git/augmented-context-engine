import {
  AnalyzeRequest,
  AnalyzeResponse,
  Insight,
  Action,
  Meta,
  Debug,
  Driver,
  Anomaly,
  Correlation
} from '../models/schemas';
import { LLMProviderFactory } from '../providers/llm.factory';
import { StatisticalAnalyzer } from '../core/statistical-analyzer';
import { PromptBuilder } from '../core/prompt-builder';
import { logger, createRequestLogger } from '../utils/logger';
import { generateId } from '../utils/helpers';
import { config } from '../config';
import {
  llmTokensInput,
  llmTokensOutput,
  llmLatency,
  analysesByMode,
  insightsGenerated,
  anomaliesDetected,
  actionsRecommended,
  analysesInProgress
} from '../utils/metrics';

export class ACEService {
  private statisticalAnalyzer: StatisticalAnalyzer;
  private promptBuilder: PromptBuilder;

  constructor() {
    this.statisticalAnalyzer = new StatisticalAnalyzer();
    this.promptBuilder = new PromptBuilder();
  }

  /**
   * Método principal de análise semântica
   */
  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const startTime = Date.now();
    const requestLogger = createRequestLogger(request.request_id, request.tenant_id);

    requestLogger.info('Iniciando análise ACE', {
      useCase: request.use_case,
      mode: request.mode,
      language: request.language
    });

    // Incrementar métrica de análises em progresso
    analysesInProgress.inc({ tenant_id: request.tenant_id || 'unknown' });

    try {
      // 1. Análise Estatística
      requestLogger.debug('Executando análise estatística');
      const statisticalAnalysis = this.statisticalAnalyzer.analyze(
        request.fsb_features,
        request.analytic_data,
        2.5 // threshold padrão
      );

      // 2. Verificar se deve usar LLM
      const shouldUseLLM = !request.constraints?.disable_llm;

      let semanticContext = '';
      let keyHighlights: string[] = [];
      let drivers: Driver[] = [];
      let insights: Insight[] = [];
      let actions: Action[] = [];
      let rawLLMOutput: string | undefined;
      let llmModelUsed: string | undefined;
      let tokensInput = 0;
      let tokensOutput = 0;

      if (shouldUseLLM) {
        // 3. Construir prompts
        requestLogger.debug('Construindo prompts');
        const systemPrompt = this.promptBuilder.buildSystemPrompt(request.mode, request.language);
        const analysisPrompt = this.promptBuilder.buildAnalysisPrompt(request, statisticalAnalysis);

        // 4. Chamar LLM
        requestLogger.debug('Chamando LLM');
        const llmProvider = LLMProviderFactory.getProvider();
        const modelInfo = llmProvider.getModelInfo();

        const llmStart = Date.now();

        const llmResponse = await llmProvider.generate({
          prompt: analysisPrompt,
          systemPrompt,
          maxTokens: request.constraints?.max_tokens || config.analysis.maxTokensDefault,
          temperature: 0.7
        });

        const llmDuration = Date.now() - llmStart;

        // Registrar métricas de LLM
        llmLatency.observe(
          { provider: llmResponse.provider, model: llmResponse.model },
          llmDuration
        );

        llmTokensInput.inc(
          { provider: llmResponse.provider, model: llmResponse.model, use_case: request.use_case },
          llmResponse.tokensInput
        );

        llmTokensOutput.inc(
          { provider: llmResponse.provider, model: llmResponse.model, use_case: request.use_case },
          llmResponse.tokensOutput
        );

        tokensInput = llmResponse.tokensInput;
        tokensOutput = llmResponse.tokensOutput;
        llmModelUsed = llmResponse.model;
        rawLLMOutput = llmResponse.text;

        // 5. Parsear resposta do LLM
        requestLogger.debug('Parseando resposta do LLM');
        const parsed = this.parseLLMResponse(llmResponse.text, request);

        semanticContext = parsed.semantic_context;
        keyHighlights = parsed.key_highlights || [];
        drivers = parsed.drivers || [];
        insights = parsed.insights || [];
        actions = parsed.actions || [];

      } else {
        // Modo sem LLM - usar apenas análise estatística
        requestLogger.debug('Modo sem LLM - usando apenas análise estatística');
        semanticContext = this.generateBasicSummary(statisticalAnalysis, request.language);
        insights = this.generateBasicInsights(statisticalAnalysis);
        actions = this.generateBasicActions(statisticalAnalysis);
      }

      // 6. Registrar métricas
      analysesByMode.inc({ mode: request.mode, tenant_id: request.tenant_id || 'unknown' });

      insights.forEach(insight => {
        insightsGenerated.inc({
          category: insight.category,
          priority: insight.priority,
          tenant_id: request.tenant_id || 'unknown'
        });
      });

      statisticalAnalysis.anomalies.forEach(anomaly => {
        anomaliesDetected.inc({
          severity: anomaly.severity,
          tenant_id: request.tenant_id || 'unknown'
        });
      });

      actions.forEach(action => {
        actionsRecommended.inc({
          action_type: action.action_type,
          urgency: action.urgency,
          tenant_id: request.tenant_id || 'unknown'
        });
      });

      // 7. Construir meta
      const duration = Date.now() - startTime;

      const meta: Meta = {
        duration_ms: duration,
        llm_model_used: llmModelUsed,
        llm_tokens_input: tokensInput,
        llm_tokens_output: tokensOutput,
        timestamp: new Date().toISOString(),
        trace_id: request.trace?.trace_id,
        warnings: []
      };

      // 8. Construir debug (opcional)
      let debug: Debug | undefined;

      if (request.return_options?.include_debug_info) {
        debug = {
          raw_llm_output: rawLLMOutput,
          feature_snapshot: request.fsb_features?.features,
          rules_fired: []
        };
      }

      // 9. Construir resposta final
      const response: AnalyzeResponse = {
        request_id: request.request_id,
        mode: request.mode,
        semantic_context: semanticContext,
        key_highlights: keyHighlights,
        drivers,
        anomalies: statisticalAnalysis.anomalies,
        correlations: statisticalAnalysis.correlations,
        insights,
        actions,
        meta,
        debug
      };

      requestLogger.info('Análise ACE concluída com sucesso', {
        durationMs: duration,
        insightsCount: insights.length,
        actionsCount: actions.length,
        anomaliesCount: statisticalAnalysis.anomalies.length
      });

      return response;

    } catch (error: any) {
      requestLogger.error('Erro durante análise ACE', { error: error.message });
      throw error;
    } finally {
      // Decrementar métrica de análises em progresso
      analysesInProgress.dec({ tenant_id: request.tenant_id || 'unknown' });
    }
  }

  /**
   * Parseia resposta do LLM tentando extrair JSON
   */
  private parseLLMResponse(text: string, request: AnalyzeRequest): any {
    try {
      // Tentar encontrar JSON no texto
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback: criar estrutura básica
      return {
        semantic_context: text,
        key_highlights: [],
        drivers: [],
        insights: [],
        actions: []
      };

    } catch (error) {
      logger.warn('Erro ao parsear resposta do LLM, usando fallback', { error });

      return {
        semantic_context: text,
        key_highlights: [],
        drivers: [],
        insights: [],
        actions: []
      };
    }
  }

  /**
   * Gera resumo básico sem LLM
   */
  private generateBasicSummary(analysis: any, language: string): string {
    const templates = {
      'pt-BR': `Análise concluída. ${analysis.anomalies.length} anomalia(s) detectada(s). ${analysis.correlations.length} correlação(ões) identificada(s).`,
      'en-US': `Analysis completed. ${analysis.anomalies.length} anomaly(ies) detected. ${analysis.correlations.length} correlation(s) identified.`,
      'es-ES': `Análisis completado. ${analysis.anomalies.length} anomalía(s) detectada(s). ${analysis.correlations.length} correlación(es) identificada(s).`
    };

    return templates[language as keyof typeof templates] || templates['en-US'];
  }

  /**
   * Gera insights básicos sem LLM
   */
  private generateBasicInsights(analysis: any): Insight[] {
    const insights: Insight[] = [];

    // Converter anomalias em insights
    analysis.anomalies.slice(0, 5).forEach((anomaly: Anomaly) => {
      insights.push({
        id: generateId('insight'),
        title: `Anomalia detectada em ${anomaly.metric}`,
        description: anomaly.description,
        category: 'risk',
        priority: anomaly.severity,
        confidence: anomaly.anomaly_score,
        related_metrics: [anomaly.metric]
      });
    });

    return insights;
  }

  /**
   * Gera ações básicas sem LLM
   */
  private generateBasicActions(analysis: any): Action[] {
    const actions: Action[] = [];

    // Criar ações baseadas em anomalias críticas
    const criticalAnomalies = analysis.anomalies.filter(
      (a: Anomaly) => a.severity === 'critical' || a.severity === 'high'
    );

    criticalAnomalies.slice(0, 3).forEach((anomaly: Anomaly) => {
      actions.push({
        id: generateId('action'),
        label: `Investigar ${anomaly.metric}`,
        description: `Anomalia ${anomaly.severity} detectada em ${anomaly.metric}. Investigação necessária.`,
        action_type: 'alert_escalation',
        urgency: anomaly.severity === 'critical' ? 'immediate' : 'high'
      });
    });

    return actions;
  }
}

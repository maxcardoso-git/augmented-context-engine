import {
  mean,
  standardDeviation,
  isAnomaly,
  pearsonCorrelation,
  normalize,
  generateId
} from '../utils/helpers';
import {
  Anomaly,
  Correlation,
  FSBFeatures,
  AnalyticData,
  Severity,
  CorrelationType
} from '../models/schemas';
import { logger } from '../utils/logger';

export interface StatisticalAnalysisResult {
  anomalies: Anomaly[];
  correlations: Correlation[];
  statistics: {
    [metric: string]: {
      mean: number;
      stdDev: number;
      min: number;
      max: number;
      current?: number;
    };
  };
}

export class StatisticalAnalyzer {
  /**
   * Analisa dados estatísticos e detecta anomalias e correlações
   */
  analyze(
    fsbFeatures?: FSBFeatures,
    analyticData?: AnalyticData,
    anomalyThreshold: number = 2.5
  ): StatisticalAnalysisResult {
    const result: StatisticalAnalysisResult = {
      anomalies: [],
      correlations: [],
      statistics: {}
    };

    try {
      // Análise de anomalias nas features do FSB
      if (fsbFeatures?.features) {
        const anomalies = this.detectAnomaliesInFeatures(
          fsbFeatures.features,
          anomalyThreshold
        );
        result.anomalies.push(...anomalies);
      }

      // Análise de dados analíticos
      if (analyticData?.tables && analyticData.tables.length > 0) {
        const { anomalies, correlations, statistics } = this.analyzeAnalyticData(
          analyticData,
          anomalyThreshold
        );

        result.anomalies.push(...anomalies);
        result.correlations.push(...correlations);
        Object.assign(result.statistics, statistics);
      }

      logger.info('Análise estatística concluída', {
        anomaliesCount: result.anomalies.length,
        correlationsCount: result.correlations.length
      });

    } catch (error: any) {
      logger.error('Erro na análise estatística', { error: error.message });
    }

    return result;
  }

  /**
   * Detecta anomalias nas features do FSB
   */
  private detectAnomaliesInFeatures(
    features: Record<string, any>,
    threshold: number
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Filtrar apenas valores numéricos
    const numericFeatures = Object.entries(features).filter(
      ([_, value]) => typeof value === 'number'
    );

    if (numericFeatures.length === 0) return anomalies;

    const values = numericFeatures.map(([_, value]) => value as number);
    const meanVal = mean(values);
    const stdDev = standardDeviation(values);

    for (const [featureName, featureValue] of numericFeatures) {
      if (isAnomaly(featureValue as number, meanVal, stdDev, threshold)) {
        const anomalyScore = Math.abs((featureValue as number - meanVal) / (stdDev || 1));
        const normalizedScore = normalize(anomalyScore, 0, 5);

        anomalies.push({
          id: generateId('anomaly'),
          metric: featureName,
          severity: this.scoreToSeverity(normalizedScore),
          anomaly_score: Math.min(normalizedScore, 1),
          description: `Feature "${featureName}" apresenta valor anômalo: ${featureValue}`
        });
      }
    }

    return anomalies;
  }

  /**
   * Analisa dados analíticos completos
   */
  private analyzeAnalyticData(
    analyticData: AnalyticData,
    threshold: number
  ): {
    anomalies: Anomaly[];
    correlations: Correlation[];
    statistics: Record<string, any>;
  } {
    const anomalies: Anomaly[] = [];
    const correlations: Correlation[] = [];
    const statistics: Record<string, any> = {};

    for (const table of analyticData.tables) {
      // Identificar colunas métricas
      const metricColumns = table.columns
        .filter(col => col.role === 'METRIC')
        .map(col => col.name);

      if (metricColumns.length === 0) continue;

      // Extrair valores de cada métrica
      const metricValues: Record<string, number[]> = {};

      for (const metricName of metricColumns) {
        metricValues[metricName] = table.rows
          .map(row => row[metricName])
          .filter(val => typeof val === 'number') as number[];
      }

      // Calcular estatísticas e detectar anomalias
      for (const [metricName, values] of Object.entries(metricValues)) {
        if (values.length === 0) continue;

        const meanVal = mean(values);
        const stdDev = standardDeviation(values);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const currentVal = values[values.length - 1];

        statistics[`${table.name}.${metricName}`] = {
          mean: meanVal,
          stdDev,
          min: minVal,
          max: maxVal,
          current: currentVal
        };

        // Detectar anomalia no valor atual
        if (isAnomaly(currentVal, meanVal, stdDev, threshold)) {
          const anomalyScore = Math.abs((currentVal - meanVal) / (stdDev || 1));
          const normalizedScore = normalize(anomalyScore, 0, 5);

          anomalies.push({
            id: generateId('anomaly'),
            metric: `${table.name}.${metricName}`,
            severity: this.scoreToSeverity(normalizedScore),
            anomaly_score: Math.min(normalizedScore, 1),
            description: `Métrica "${metricName}" em "${table.name}" apresenta anomalia: ${currentVal.toFixed(2)}`
          });
        }
      }

      // Calcular correlações entre métricas
      const metricNames = Object.keys(metricValues);
      for (let i = 0; i < metricNames.length; i++) {
        for (let j = i + 1; j < metricNames.length; j++) {
          const metricX = metricNames[i];
          const metricY = metricNames[j];

          const valuesX = metricValues[metricX];
          const valuesY = metricValues[metricY];

          if (valuesX.length !== valuesY.length || valuesX.length < 3) continue;

          const correlation = pearsonCorrelation(valuesX, valuesY);
          const absCorrelation = Math.abs(correlation);

          // Apenas correlações significativas (> 0.5)
          if (absCorrelation > 0.5) {
            correlations.push({
              metric_x: `${table.name}.${metricX}`,
              metric_y: `${table.name}.${metricY}`,
              correlation_type: this.determineCorrelationType(correlation),
              correlation_score: absCorrelation,
              explanation: `Correlação ${correlation > 0 ? 'positiva' : 'negativa'} de ${(absCorrelation * 100).toFixed(1)}% entre ${metricX} e ${metricY}`
            });
          }
        }
      }
    }

    return { anomalies, correlations, statistics };
  }

  /**
   * Converte score numérico para severidade
   */
  private scoreToSeverity(score: number): Severity {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Determina tipo de correlação baseado no valor
   */
  private determineCorrelationType(correlation: number): CorrelationType {
    if (Math.abs(correlation) < 0.3) return 'none';
    if (correlation > 0) return 'positive';
    return 'negative';
  }
}

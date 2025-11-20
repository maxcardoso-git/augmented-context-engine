import { nanoid } from 'nanoid';

/**
 * Gera um ID único para requisições
 */
export function generateRequestId(): string {
  return `req-${Date.now()}-${nanoid(8)}`;
}

/**
 * Gera um ID único genérico
 */
export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Calcula média de array de números
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calcula desvio padrão
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Normaliza valor entre 0 e 1
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calcula Z-score
 */
export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Detecta anomalia usando Z-score
 */
export function isAnomaly(value: number, mean: number, stdDev: number, threshold: number = 2.5): boolean {
  const z = Math.abs(zScore(value, mean, stdDev));
  return z > threshold;
}

/**
 * Calcula correlação de Pearson entre duas arrays
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Mascara dados sensíveis
 */
export function maskSensitiveData(data: any): any {
  const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apiKey', 'apikey'];

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  const masked: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      masked[key] = '***MASKED***';
    } else if (typeof value === 'object') {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${formatNumber(value * 100, decimals)}%`;
}

/**
 * Trunca texto
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry helper
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt);
      }
    }
  }

  throw lastError;
}

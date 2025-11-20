import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ACEService } from '../../services/ace.service';
import { AnalyzeRequest } from '../../models/schemas';
import { logger } from '../../utils/logger';
import { requestsTotal, requestLatency } from '../../utils/metrics';

const aceService = new ACEService();

export async function analyzeHandler(req: AuthRequest, res: Response) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string;
  const tenantId = req.tenantId || 'unknown';

  try {
    // Construir request completo
    const analyzeRequest: AnalyzeRequest = {
      ...req.body,
      request_id: req.body.request_id || requestId,
      tenant_id: req.body.tenant_id || tenantId
    };

    logger.info('Processando request de análise', {
      requestId: analyzeRequest.request_id,
      tenantId: analyzeRequest.tenant_id,
      useCase: analyzeRequest.use_case,
      mode: analyzeRequest.mode
    });

    // Executar análise
    const result = await aceService.analyze(analyzeRequest);

    const duration = Date.now() - startTime;

    // Registrar métricas
    requestsTotal.inc({
      method: req.method,
      endpoint: '/v1/analyze',
      status_code: '200',
      tenant_id: tenantId
    });

    requestLatency.observe(
      {
        method: req.method,
        endpoint: '/v1/analyze',
        tenant_id: tenantId
      },
      duration
    );

    logger.info('Análise concluída com sucesso', {
      requestId: analyzeRequest.request_id,
      tenantId: analyzeRequest.tenant_id,
      durationMs: duration
    });

    res.status(200).json(result);

  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Erro ao processar análise', {
      requestId,
      tenantId,
      error: error.message,
      durationMs: duration
    });

    requestsTotal.inc({
      method: req.method,
      endpoint: '/v1/analyze',
      status_code: '500',
      tenant_id: tenantId
    });

    throw error;
  }
}

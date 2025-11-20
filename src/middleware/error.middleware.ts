import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { errorsTotal } from '../utils/metrics';
import { ErrorResponse } from '../models/schemas';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string;
  const tenantId = req.headers['x-tenant-id'] as string;

  logger.error('Error handler acionado', {
    requestId,
    tenantId,
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  errorsTotal.inc({
    error_type: err.name || 'unknown',
    endpoint: req.path,
    tenant_id: tenantId || 'unknown'
  });

  // Determinar código de status
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_ERROR';
  let errorMessage = err.message || 'Erro interno do servidor';
  let retryable = true;

  // Casos específicos
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = 'Erro de validação nos dados enviados';
    retryable = false;
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    errorMessage = 'Não autorizado';
    retryable = false;
  }

  if (err.message?.includes('timeout') || err.message?.includes('TIMEOUT')) {
    statusCode = 504;
    errorCode = 'TIMEOUT';
    errorMessage = 'Tempo limite excedido';
    retryable = true;
  }

  const errorResponse: ErrorResponse = {
    request_id: requestId,
    error: {
      code: errorCode,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        originalError: err.message,
        stack: err.stack
      } : undefined,
      retryable
    }
  };

  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response) {
  const requestId = req.headers['x-request-id'] as string;

  logger.warn('Rota não encontrada', {
    requestId,
    path: req.path,
    method: req.method
  });

  errorsTotal.inc({
    error_type: 'not_found',
    endpoint: req.path,
    tenant_id: 'unknown'
  });

  const errorResponse: ErrorResponse = {
    request_id: requestId,
    error: {
      code: 'NOT_FOUND',
      message: `Rota não encontrada: ${req.method} ${req.path}`,
      retryable: false
    }
  };

  res.status(404).json(errorResponse);
}

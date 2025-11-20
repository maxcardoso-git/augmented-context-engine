import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';
import { errorsTotal } from '../utils/metrics';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const requestId = req.headers['x-request-id'] as string;
        const tenantId = req.headers['x-tenant-id'] as string;

        logger.warn('Validação de body falhou', {
          requestId,
          tenantId,
          errors: error.errors,
          path: req.path
        });

        errorsTotal.inc({
          error_type: 'validation_error',
          endpoint: req.path,
          tenant_id: tenantId || 'unknown'
        });

        return res.status(400).json({
          request_id: requestId,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação nos dados enviados',
            details: {
              errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
              }))
            },
            retryable: false
          }
        });
      }

      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const requestId = req.headers['x-request-id'] as string;

        logger.warn('Validação de query falhou', {
          requestId,
          errors: error.errors,
          path: req.path
        });

        return res.status(400).json({
          request_id: requestId,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação nos parâmetros da query',
            details: {
              errors: error.errors
            },
            retryable: false
          }
        });
      }

      next(error);
    }
  };
}

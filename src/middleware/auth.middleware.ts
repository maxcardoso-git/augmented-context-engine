import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';
import { errorsTotal } from '../utils/metrics';

export interface AuthRequest extends Request {
  userId?: string;
  tenantId?: string;
  scopes?: string[];
}

/**
 * Middleware de autenticação via Bearer Token (JWT)
 * Simplificado - em produção, usar biblioteca como jsonwebtoken
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Request sem token de autenticação', {
        path: req.path,
        method: req.method
      });

      errorsTotal.inc({ error_type: 'unauthorized', endpoint: req.path, tenant_id: 'unknown' });

      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token de autenticação não fornecido',
          retryable: false
        }
      });
    }

    const token = authHeader.substring(7);

    // Validação simplificada do token
    // Em produção, usar jwt.verify() com chave pública
    if (!token || token.length < 10) {
      logger.warn('Token inválido', { path: req.path });

      errorsTotal.inc({ error_type: 'invalid_token', endpoint: req.path, tenant_id: 'unknown' });

      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token de autenticação inválido',
          retryable: false
        }
      });
    }

    // Mock: Extrair informações do token
    // Em produção, isso viria do payload JWT decodificado
    req.userId = 'user-from-token';
    req.scopes = ['sas:analyze', 'sas:read-config'];

    next();

  } catch (error: any) {
    logger.error('Erro no middleware de autenticação', { error: error.message });

    errorsTotal.inc({ error_type: 'auth_error', endpoint: req.path, tenant_id: 'unknown' });

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno de autenticação',
        retryable: true
      }
    });
  }
}

/**
 * Middleware para extrair Tenant ID do header
 */
export function tenantMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const tenantId = req.headers['x-tenant-id'] as string;

  if (config.multiTenant.enabled && !tenantId) {
    logger.warn('Request sem tenant ID em modo multi-tenant', {
      path: req.path,
      method: req.method
    });

    errorsTotal.inc({ error_type: 'missing_tenant', endpoint: req.path, tenant_id: 'unknown' });

    return res.status(400).json({
      error: {
        code: 'MISSING_TENANT_ID',
        message: 'Header X-Tenant-Id é obrigatório',
        retryable: false
      }
    });
  }

  req.tenantId = tenantId || 'default';

  next();
}

/**
 * Middleware para adicionar Request ID
 */
export function requestIdMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  req.headers['x-request-id'] = requestId;

  // Adicionar ao response header
  res.setHeader('X-Request-Id', requestId);

  next();
}

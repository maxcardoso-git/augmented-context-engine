import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';
import { analyzeHandler } from '../controllers/analyze.controller';
import { listModels } from '../controllers/models.controller';
import { getMetrics } from '../controllers/metrics.controller';
import { authMiddleware, tenantMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validator.middleware';
import { AnalyzeRequestSchema } from '../../models/schemas';

const router = Router();

// Health Check (sem autenticação)
router.get('/health', healthCheck);

// Metrics (sem autenticação - mas em produção deveria ter)
router.get('/metrics', getMetrics);

// Analyze (com autenticação e validação)
router.post(
  '/analyze',
  authMiddleware,
  tenantMiddleware,
  validateBody(AnalyzeRequestSchema),
  analyzeHandler
);

// List Models (com autenticação)
router.get(
  '/models',
  authMiddleware,
  listModels
);

export default router;

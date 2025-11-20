import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import routes from './api/routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestIdMiddleware } from './middleware/auth.middleware';

class ACEServer {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: '*', // Em produção, configurar origins específicas
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Request-Id']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID
    this.app.use(requestIdMiddleware);

    // Request logging
    this.app.use((req, res, next) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('HTTP Request', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: duration,
          requestId: req.headers['x-request-id']
        });
      });

      next();
    });
  }

  private setupRoutes(): void {
    // Base path
    const basePath = '/sas-cag/v1';

    // Health check direto na raiz também
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: config.service.name });
    });

    // Rotas principais
    this.app.use(basePath, routes);

    logger.info(`Rotas configuradas no path base: ${basePath}`);
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Error handler
    this.app.use(errorHandler);
  }

  public start(): void {
    const port = config.service.port;

    this.app.listen(port, () => {
      logger.info(`🚀 ACE Server iniciado`, {
        service: config.service.name,
        version: config.service.version,
        environment: config.service.env,
        port,
        basePath: '/sas-cag/v1',
        llmProvider: config.llm.defaultProvider,
        llmModel: config.llm.defaultModel,
        multiTenantEnabled: config.multiTenant.enabled,
        metricsEnabled: config.observability.metricsEnabled,
        tracingEnabled: config.observability.tracingEnabled
      });

      logger.info(`📊 Endpoints disponíveis:`);
      logger.info(`  GET  /health`);
      logger.info(`  GET  /sas-cag/v1/health`);
      logger.info(`  GET  /sas-cag/v1/metrics`);
      logger.info(`  GET  /sas-cag/v1/models`);
      logger.info(`  POST /sas-cag/v1/analyze`);
    });
  }
}

// Iniciar servidor
const server = new ACEServer();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

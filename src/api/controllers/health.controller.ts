import { Request, Response } from 'express';
import { config } from '../../config';

const startTime = Date.now();

export async function healthCheck(req: Request, res: Response) {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  // Verificar saúde básica do serviço
  const status = 'ok'; // Poderia verificar conexões com LLMs, Redis, etc.

  res.status(200).json({
    status,
    timestamp: new Date().toISOString(),
    version: config.service.version,
    uptime_seconds: uptime,
    service: config.service.name,
    environment: config.service.env
  });
}

import { Request, Response } from 'express';
import { metricsRegistry } from '../../utils/metrics';

export async function getMetrics(req: Request, res: Response) {
  res.set('Content-Type', metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
}

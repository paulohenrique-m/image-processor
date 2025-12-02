import { jobService } from '../services/jobService.js';

export class MetricsController {
  async getMetrics(req, res, next) {
    try {
      const metrics = jobService.getMetrics();
      
      const allJobs = jobService.getAllJobs();
      const statusCounts = {
        pending: allJobs.filter(job => job.status === 'pending').length,
        processing: allJobs.filter(job => job.status === 'processing').length,
        completed: allJobs.filter(job => job.status === 'completed').length,
        failed: allJobs.filter(job => job.status === 'failed').length
      };

      res.json({
        success: true,
        metrics: {
          ...metrics,
          statusCounts,
          totalJobs: allJobs.length,
          connectedClients: req.app.get('socketService')?.getConnectedClients() || 0
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getSystemHealth(req, res, next) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        rabbitMQ: req.app.get('rabbitMQ') ? 'connected' : 'disconnected',
        statusConsumer: req.app.get('statusConsumer')?.isConsuming ? 'running' : 'stopped'
      };

      res.json({
        success: true,
        health
      });

    } catch (error) {
      next(error);
    }
  }
}

export const metricsController = new MetricsController();
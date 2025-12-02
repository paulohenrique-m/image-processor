import { jobService } from '../services/jobService.js';

export class JobController {
  async getAllJobs(req, res, next) {
    try {
      const { limit = 50, status } = req.query;
      
      let jobs;
      if (status) {
        jobs = jobService.getJobsByStatus(status);
      } else {
        jobs = jobService.getAllJobs(parseInt(limit));
      }
  
      const jobsArray = Array.isArray(jobs) ? jobs : [];
  
      res.json({
        success: true,
        count: jobsArray.length,
        jobs: jobsArray.map(job => ({
          id: job.id,
          filename: job.filename,
          status: job.status,
          progress: job.progress,
          timestamp: job.timestamp,
          lastUpdate: job.lastUpdate,
          metadata: {
            fileSize: job.metadata?.fileSize,
            originalName: job.metadata?.originalName,
            ...(job.status === 'completed' && {
              processedSize: job.metadata?.processedSize,
              compressionRatio: job.metadata?.compressionRatio,
              dimensions: job.metadata?.dimensions
            })
          }
        }))
      });
  
    } catch (error) {
      next(error);
    }
  }

  async getJob(req, res, next) {
    try {
      const { jobId } = req.params;
      
      const job = jobService.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `Job with ID ${jobId} not found`
        });
      }

      res.json({
        success: true,
        job: {
          id: job.id,
          filename: job.filename,
          status: job.status,
          progress: job.progress,
          timestamp: job.timestamp,
          lastUpdate: job.lastUpdate,
          metadata: job.metadata,
          updates: job.updates.slice(-10)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req, res, next) {
    try {
      const { jobId } = req.params;
      
      const deleted = jobService.deleteJob(jobId);
      
      if (!deleted) {
        return res.status(404).json({
          error: 'Job not found',
          message: `Job with ID ${jobId} not found`
        });
      }

      // Emit metrics update
      const metrics = jobService.getMetrics();
      req.app.get('socketService').emitMetricsUpdate(metrics);

      res.json({
        success: true,
        message: 'Job deleted successfully',
        jobId
      });

    } catch (error) {
      next(error);
    }
  }

  async getJobStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      
      const job = jobService.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `Job with ID ${jobId} not found`
        });
      }

      res.json({
        success: true,
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        timestamp: job.timestamp,
        lastUpdate: job.lastUpdate
      });

    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
const jobs = new Map();
const metrics = {
  queueSize: 0,
  activeWorkers: 0,
  processedToday: 0,
  averageProcessingTime: 0,
  totalProcessed: 0,
  totalErrors: 0,
};

export class JobService {
  constructor() {
    this.jobs = jobs;
    this.metrics = metrics;
  }

  createJob(jobData) {
    const job = {
      id: jobData.id,
      filename: jobData.filename,
      status: "pending",
      progress: 0,
      timestamp: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      metadata: jobData.metadata || {},
      updates: [],
    };

    this.jobs.set(job.id, job);
    this.updateMetrics();

    console.log(`Job created: ${job.id} - ${job.filename}`);
    return job;
  }

  
  getMetrics() {
    return this.metrics;
  }

  getJobsByStatus(status) {
    const allJobs = Array.from(this.jobs.values());
    return allJobs.filter((job) => job.status === status);
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getAllJobs(limit = 50) {
    const allJobs = Array.from(this.jobs.values());
    return allJobs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  updateJobStatus(jobId, status, progress = 0, metadata = {}) {
    const job = this.jobs.get(jobId);

    if (job) {
      job.status = status;
      job.progress = progress;
      job.lastUpdate = new Date().toISOString();
      job.metadata = { ...job.metadata, ...metadata };

      job.updates.push({
        status,
        progress,
        timestamp: new Date().toISOString(),
        metadata,
      });

      this.updateMetrics();

      console.log(`updated: ${jobId} - ${status} (${progress}%)`);
      return job;
    }

    console.warn(`Error: ${jobId}`);
    return null;
  }

  deleteJob(jobId) {
    const deleted = this.jobs.delete(jobId);
    this.updateMetrics();
    console.log(`deleted: ${jobId}`);

    return deleted;
  }

  updateMetrics() {
    const allJobs = Array.from(this.jobs.values());
    const today = new Date().toDateString();

    this.metrics.queueSize = allJobs.filter(
      (job) => job.status === "pending" || job.status === "processing"
    ).length;

    this.metrics.processedToday = allJobs.filter(
      (job) =>
        job.status === "completed" &&
        new Date(job.timestamp).toDateString() === today
    ).length;

    this.metrics.totalProcessed = allJobs.filter(
      (job) => job.status === "completed"
    ).length;

    this.metrics.totalErrors = allJobs.filter(
      (job) => job.status === "failed"
    ).length;

    // simulate!! TODO: gonna change this when using a real db
    this.metrics.activeWorkers = Math.min(
      Math.ceil(this.metrics.queueSize / 2),
      5
    );

    // Calculate average processing time
    const completedJobs = allJobs.filter((job) => job.status === "completed");
    if (completedJobs.length > 0) {
      const totalTime = completedJobs.reduce((sum, job) => {
        if (job.metadata.processTime) {
          return sum + job.metadata.processTime;
        }
        return sum + 2000; // Default 2 seconds
      }, 0);

      this.metrics.averageProcessingTime = Math.floor(
        totalTime / completedJobs.length
      );
    }
  }


  cleanupOldJobs() {
    const allJobs = Array.from(this.jobs.values());
    if (allJobs.length > 100) {
      const sortedJobs = allJobs.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      const jobsToRemove = sortedJobs.slice(0, allJobs.length - 100);
      jobsToRemove.forEach((job) => this.jobs.delete(job.id));
    }
  }
}

export const jobService = new JobService();

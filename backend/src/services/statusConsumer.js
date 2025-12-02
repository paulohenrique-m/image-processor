import { rabbitMQ } from '../config/rabbitmq.js';
import { jobService } from './jobService.js';
import { socketService } from './socketService.js';

export class StatusConsumer {
  constructor() {
    this.isConsuming = false;
  }

  async start() {
    if (this.isConsuming) {
      return;
    }

    try {
      console.log('Starting consumer...');
      
      await rabbitMQ.consumeStatusUpdates(async (statusUpdate, message) => {
        try {
          console.log(`Received: ${statusUpdate.jobId} - ${statusUpdate.status}`);

          const updatedJob = jobService.updateJobStatus(
            statusUpdate.jobId,
            statusUpdate.status,
            statusUpdate.progress || 0,
            statusUpdate.metadata || {}
          );

          if (updatedJob) {
            socketService.emitJobStatusUpdate({
              jobId: statusUpdate.jobId,
              status: statusUpdate.status,
              progress: statusUpdate.progress || 0,
              timestamp: statusUpdate.timestamp,
              metadata: statusUpdate.metadata
            });

            const metrics = jobService.getMetrics();
            socketService.emitMetricsUpdate(metrics);

            console.log(`Status processed: ${statusUpdate.jobId} - ${statusUpdate.status}`);
          } else {
            console.warn(`Error in update: ${statusUpdate.jobId}`);
          }

          rabbitMQ.ack(message);
          
        } catch (error) {
          console.error(`Error: ${statusUpdate.jobId}:`, error);
          rabbitMQ.nack(message, false); // Não reenfileirar
        }
      });

      this.isConsuming = true;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  stop() {
    this.isConsuming = false;
  }
}

export const statusConsumer = new StatusConsumer();
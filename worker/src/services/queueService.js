import { rabbitMQ } from "../config/rabbitmq.js";
import { imageProcessor } from "../processors/imageProcessor.js";

export class WorkerQueueService {
  constructor() {
    this.rabbitMQ = rabbitMQ;
    this.isProcessing = false;
  }

  async startImageProcessing() {
    console.log("Starting image processing worker");

    await this.rabbitMQ.consume("image_queue", async (job, channelMessage) => {
      try {
        this.isProcessing = true;

        console.log(`Worker received job: ${job.id}`);

        // Publish
        await this.publishStatusUpdate({
          jobId: job.id,
          status: "processing",
          progress: 0,
          timestamp: new Date().toISOString(),
        });

        // TODO: simulate a progressbar call publishStatusUpdate here?

        const result = await imageProcessor.processImage(job);

        if (result.success) {
          await this.publishStatusUpdate({
            jobId: job.id,
            status: "completed",
            progress: 100,
            timestamp: new Date().toISOString(),
            metadata: {
              ...result.metadata,
              processedImage: result.processedImage,
              processedMimeType: "image/jpeg",
            },
          });

          console.log(`completed: ${job.id}`);
        } else {
          await this.publishStatusUpdate({
            jobId: job.id,
            status: "failed",
            progress: 0,
            timestamp: new Date().toISOString(),
            metadata: {
              error: result.error,
              ...result.metadata,
            },
          });

          console.log(`Error: ${job.id} - ${result.error}`);
        }

        this.rabbitMQ.ack(channelMessage);
      } catch (error) {
        console.error(`Error ${job.id}:`, error);

        await this.publishStatusUpdate({
          jobId: job.id,
          status: "failed",
          progress: 0,
          timestamp: new Date().toISOString(),
          metadata: {
            error: error.message,
          },
        });

        // TODO: enqueue the error or change responsability
        this.rabbitMQ.nack(channelMessage, false);
      } finally {
        this.isProcessing = false;
      }
    });
  }

  async publishStatusUpdate(update) {
    try {
      await this.rabbitMQ.publishToQueue("status_queue", update);
      console.log(`Worker status: ${update.jobId} - ${update.status}`);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async stop() {
    this.isProcessing = false;
    await this.rabbitMQ.close();
  }
}

export const workerQueueService = new WorkerQueueService();

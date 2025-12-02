import { rabbitMQ } from "../config/rabbitmq.js";
import { v4 as uuidv4 } from "uuid";

export class QueueService {
  constructor() {
    this.rabbitMQ = rabbitMQ;
  }

  async publishImageJob(imageData, filename, fileSize, mimeType) {
    const jobId = uuidv4();

    const job = {
      id: jobId,
      filename,
      imageData, // Base64 string do not forget
      status: "pending",
      timestamp: new Date().toISOString(),
      metadata: {
        originalName: filename,
        fileSize: fileSize,
        mimeType: mimeType,
        uploadTime: new Date().toISOString(),
      },
    };

    try {
      await this.rabbitMQ.publishToQueue("image_queue", job);
      console.log(`published to queue: ${jobId} - ${filename}`);

      return jobId;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed publish");
    }
  }

  async publishStatusUpdate(update) {
    try {
      await this.rabbitMQ.publishToExchange(
        "image_processing",
        "status",
        update
      );

      console.log(`Status published: ${update.jobId} - ${update.status}`);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}

export const queueService = new QueueService();

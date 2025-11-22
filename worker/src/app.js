import "dotenv/config";
import { rabbitMQ } from "./config/rabbitmq.js";
import { workerQueueService } from "./services/queueService.js";

class Worker {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    try {
      console.log("Starting Image Processor Worker");
      await rabbitMQ.connect();
      await workerQueueService.startImageProcessing();

      this.isRunning = true;
      console.log("success Worker");

      process.on("SIGINT", this.shutdown.bind(this));
      process.on("SIGTERM", this.shutdown.bind(this));
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  }

  async shutdown() {
    if (!this.isRunning) return;
    this.isRunning = false;
    await workerQueueService.stop();
    process.exit(0);
  }
}

const worker = new Worker();
worker.start().catch(console.error);

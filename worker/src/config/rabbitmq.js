import amqp from "amqplib";

class RabbitMQConfig {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      console.log("worker rabbitmq");

      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://localhost:5672"
      );
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue("image_queue", { durable: true });
      await this.channel.assertQueue("status_queue", { durable: true });

      console.log("success");

      return this;
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async consume(queueName, callback) {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    console.log(`Worker Consuming in: ${queueName}`);

    await this.channel.consume(
      queueName,
      (message) => {
        if (message !== null) {
          try {
            const content = JSON.parse(message.content.toString());
            callback(content, message);
          } catch (error) {
            console.error("Error: ", error);
            this.channel.nack(message, false, false);
          }
        }
      },
      {
        noAck: false,
        // TODO: adjust prefetch?
        // Prefetch para processar 1 job por vez
        prefetch: 1,
      }
    );
  }

  // acknowledge
  ack(message) {
    this.channel.ack(message);
  }

  // !acknowledge
  nack(message, requeue = false) {
    this.channel.nack(message, false, requeue);
  }

  async publishToQueue(queueName, message) {
    // TODO: change this return?
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.sendToQueue(queueName, buffer, { persistent: true });
  }
}

export const rabbitMQ = new RabbitMQConfig();

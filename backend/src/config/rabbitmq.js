import amqp from "amqplib";

class RabbitMQConfig {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      console.log("Backend connecting to RabbitMQ");

      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://localhost:5672"
      );
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange("image_processing", "direct", {
        durable: true,
      });

      // Queue
      await this.channel.assertQueue("image_queue", { durable: true });
      await this.channel.assertQueue("status_queue", { durable: true });

      await this.channel.bindQueue(
        "image_queue",
        "image_processing",
        "process"
      );
      await this.channel.bindQueue(
        "status_queue",
        "image_processing",
        "status"
      );

      console.log("success");

      return this;
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  }

  async publishToQueue(queueName, message) {
    if (!this.channel) {
      throw new Error("Error channel");
    }

    const buffer = Buffer.from(JSON.stringify(message));

    return this.channel.sendToQueue(queueName, buffer, {
      persistent: true,
      contentType: "application/json",
    });
  }

  async publishToExchange(exchange, routingKey, message) {
    if (!this.channel) {
      throw new Error("Error channel");
    }

    const buffer = Buffer.from(JSON.stringify(message));

    return this.channel.publish(exchange, routingKey, buffer, {
      persistent: true,
      contentType: "application/json",
    });
  }

  async consumeStatusUpdates(callback) {
    if (!this.channel) {
      throw new Error("Error channel");
    }

    await this.channel.consume(
      "status_queue",
      (message) => {
        if (message !== null) {
          try {
            const content = JSON.parse(message.content.toString());
            callback(content, message);
          } catch (error) {
            console.error("Error processing status message:", error);
            this.channel.nack(message, false, false);
          }
        }
      },
      { noAck: false }
    );
  }

  ack(message) {
    this.channel.ack(message);
  }

  nack(message, requeue = false) {
    this.channel.nack(message, false, requeue);
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export const rabbitMQ = new RabbitMQConfig();

import { socketConfig } from '../config/socket.js';

export class SocketService {
  constructor() {
    this.io = null;
  }

  initialize(server) {
    this.io = socketConfig.initialize(server);
    return this.io;
  }

  emitJobStatusUpdate(update) {
    if (this.io) {
      this.io.emit('job_status_update', update);
      this.io.to(`job_${update.jobId}`).emit('job_update', update);
    }
  }

  emitMetricsUpdate(metrics) {
    if (this.io) {
      this.io.emit('metrics_update', metrics);
      console.log("entrou aqui metricas");
    }
  }

  emitSystemNotification(message, type = 'info') {
    if (this.io) {
      this.io.emit('system_notification', {
        message,
        type,
        timestamp: new Date().toISOString()
      });
    }
  }

  getConnectedClients() {
    if (this.io) {
      return this.io.engine.clientsCount;
    }
    return 0;
  }
}

export const socketService = new SocketService();
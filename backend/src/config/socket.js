import { Server } from "socket.io";

class SocketConfig {
  constructor() {
    this.io = null;
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    return this.io;
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join_job", (jobId) => {
        socket.join(`job_${jobId}`);
        console.log("JOIN JOB ->" + jobId);
      });

      socket.on("leave_job", (jobId) => {
        socket.leave(`job_${jobId}`);
        console.log("EXIT JOB ->" + jobId);
      });

      socket.on("disconnect", (reason) => {
        console.log("disconnected:", socket.id, reason);
      });

      socket.on("error", (error) => {
        console.error("Error:", error);
      });
    });
  }

  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  emitToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  emitToSocket(socketId, event, data) {
    if (this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  getConnectedClients() {
    if (this.io) {
      return this.io.engine.clientsCount;
    }
    return 0;
  }
}

export const socketConfig = new SocketConfig();

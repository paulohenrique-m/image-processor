import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { rabbitMQ } from './config/rabbitmq.js';
import { socketService } from './services/socketService.js';
import { statusConsumer } from './services/statusConsumer.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    console.log('Starting Image Processor Backend...');
    await rabbitMQ.connect();
    app.set('rabbitMQ', rabbitMQ);
    const io = socketService.initialize(server);
    app.set('socketService', socketService);
    await statusConsumer.start();
    app.set('statusConsumer', statusConsumer);

    server.listen(PORT, () => {
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  try {
    await statusConsumer.stop();
    await rabbitMQ.close();
    
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => {
      process.exit(1);
    }, 5000);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
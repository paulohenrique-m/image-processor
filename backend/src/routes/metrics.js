import express from 'express';
import { metricsController } from '../controllers/metricsController.js';

const router = express.Router();

// Get system metrics
router.get('/', metricsController.getMetrics.bind(metricsController));

// Get system health
router.get('/health', metricsController.getSystemHealth.bind(metricsController));

export default router;
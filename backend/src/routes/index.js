import express from 'express';
import imagesRouter from './images.js';
import jobsRouter from './jobs.js';
import metricsRouter from './metrics.js';

const router = express.Router();

// API routes
router.use('/images', imagesRouter);
router.use('/jobs', jobsRouter);
router.use('/metrics', metricsRouter);

router.get('/', (req, res) => {
  res.json({
    message: 'Image Processor API',
    version: '1.0.0',
    endpoints: {
      images: '/api/images',
      jobs: '/api/jobs', 
      metrics: '/api/metrics'
    }
  });
});

export default router;
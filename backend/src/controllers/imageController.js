import { queueService } from "../services/queueService.js";
import { jobService } from "../services/jobService.js";
import { socketService } from "../services/socketService.js";

export class ImageController {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          message: "Please select an image file to upload",
        });
      }

      const { originalname, buffer, mimetype, size } = req.file;
      const imageData = buffer.toString("base64");

      const jobId = await queueService.publishImageJob(
        imageData,
        originalname,
        size,
        mimetype
      );

      const job = jobService.createJob({
        id: jobId,
        filename: originalname,
        metadata: {
          originalName: originalname,
          fileSize: size,
          mimeType: mimetype,
          uploadTime: new Date().toISOString(),
        },
      });

      socketService.emitJobStatusUpdate({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        timestamp: job.timestamp,
      });

      // Emit metrics update
      const metrics = jobService.getMetrics();
      socketService.emitMetricsUpdate(metrics);

      res.status(202).json({
        success: true,
        message: "Image uploaded and queued for processing",
        jobId: job.id,
        job: {
          id: job.id,
          filename: job.filename,
          status: job.status,
          progress: job.progress,
          timestamp: job.timestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProcessedImage(req, res, next) {
    try {
      const { jobId } = req.params;

      const job = jobService.getJob(jobId);

      if (!job) {
        return res.status(404).json({
          error: "Job not found",
          message: `Job with ID ${jobId} not found`,
        });
      }

      if (job.status !== "completed") {
        return res.status(400).json({
          error: "Image not ready",
          message: "Image processing is not completed yet",
        });
      }

      if (!job.metadata.processedImage) {
        return res.status(404).json({
          error: "Processed image not found",
          message: "Processed image data is not available",
        });
      }

      // Convert base64 back to buffer
      const imageBuffer = Buffer.from(job.metadata.processedImage, "base64");

      // Set appropriate headers review this!!
      res.set({
        "Content-Type": job.metadata.processedMimeType || "image/jpeg",
        "Content-Length": imageBuffer.length,
        "Content-Disposition": `attachment; filename="processed_${job.filename}"`,
      });

      res.send(imageBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const imageController = new ImageController();

import express from "express";
import { jobController } from "../controllers/jobController.js";

const router = express.Router();

// Get all jobs
router.get("/", jobController.getAllJobs.bind(jobController));

// Get specific job
router.get("/:jobId", jobController.getJob.bind(jobController));

// Get job status
router.get("/:jobId/status", jobController.getJobStatus.bind(jobController));

// Delete job
router.delete("/:jobId", jobController.deleteJob.bind(jobController));

export default router;

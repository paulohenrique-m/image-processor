import express from "express";
import { imageController } from "../controllers/imageController.js";
import { upload, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("image"),
  handleUploadError,
  imageController.uploadImage.bind(imageController)
);

router.get(
  "/:jobId/download",
  imageController.getProcessedImage.bind(imageController)
);

export default router;

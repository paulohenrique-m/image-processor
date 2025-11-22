import sharp from "sharp";

export class ImageProcessor {
  constructor() {
    this.supportedFormats = ["jpeg", "jpg", "png"];
  }

  async processImage(job) {
    const { id: jobId, imageData, filename } = job;

    console.log(`Processing: ${filename} (${jobId})`);

    try {
      const imageBuffer = Buffer.from(imageData, "base64");

      const processedImage = await sharp(imageBuffer)
        .resize(800, 600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          mozjpeg: true,
        })
        .toBuffer();

      const metadata = await sharp(processedImage).metadata();
      const originalSize = imageBuffer.length;
      const processedSize = processedImage.length;
      const compressionRatio = (
        ((originalSize - processedSize) / originalSize) *
        100
      ).toFixed(1);

      console.log(`Original: ${this.formatBytes(originalSize)}`);
      console.log(`Processed: ${this.formatBytes(processedSize)}`);
      console.log(`Compression: ${compressionRatio}%`);

      return {
        success: true,
        processedImage: processedImage.toString("base64"),
        metadata: {
          originalSize,
          processedSize,
          compressionRatio: `${compressionRatio}%`,
          dimensions: {
            width: metadata.width,
            height: metadata.height,
          },
          format: metadata.format,
          processTime: Date.now() - new Date(job.timestamp).getTime(),
        },
      };
    } catch (error) {
      console.error("Error: ", error);

      return {
        success: false,
        error: error.message,
        metadata: {
          processTime: Date.now() - new Date(job.timestamp).getTime(),
        },
      };
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // TODO: do a progress bar?
  async simulateProgress() {}
}

export const imageProcessor = new ImageProcessor();

export const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  if (error.message.includes("RabbitMQ")) {
    return res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Message queue service is down",
    });
  }

  if (error.message.includes("Not an image")) {
    return res.status(400).json({
      error: "Invalid file type",
      message: "Please upload only image files",
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
};

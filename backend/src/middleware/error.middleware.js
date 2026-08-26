export default (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Error handler caught:", err);
  }

  // Mongoose Cast Error (Invalid ObjectId format)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for ${err.path}`,
    });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join("; ") || err.message,
    });
  }

  // MongoDB Duplicate Key Error (code 11000)
  if (err.name === "MongoServerError" && err.code === 11000) {
    const keys = Object.keys(err.keyValue || {});
    const field = keys[0] ? keys[0].toUpperCase() : "Record";
    const val = keys[0] ? err.keyValue[keys[0]] : "";
    return res.status(409).json({
      success: false,
      message: `${field} '${val}' already exists. Please use a unique value.`,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};


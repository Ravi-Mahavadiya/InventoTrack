import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import transactionRoutes from "./modules/transactions/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./docs/swagger.json"), "utf8")
);

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/inventro_track";
const port = process.env.PORT || 5000;
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check route
app.get("/health", (_req, res) => res.json({ status: "ok", message: "InventoTrack API is healthy" }));

// Register Swagger UI Doc route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found - ${req.originalUrl}` });
});

// Global Error Handler Middleware
app.use(errorMiddleware);

async function connectDB() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Database:=", mongoose.connection.name || "inventro_track");
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
}

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`InventoTrack Backend Server running on port ${port}`);
    console.log(`Health endpoint: http://localhost:${port}/health`);
  });
}

startServer();

export default app;
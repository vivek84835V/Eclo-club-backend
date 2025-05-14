import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet"; // Security headers
import compression from "compression"; // Gzip compression
import MainAllRoutes from "./routes/All_routes.js";
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // 🔥 Allow all origins for now (for production, replace * with your frontend URL)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(helmet()); // 🔒 Secure HTTP headers
app.use(compression()); // ⚡ Compress responses
app.use(express.json({ limit: "10mb" })); // 🛡 Limit large requests
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", MainAllRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

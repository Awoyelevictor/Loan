import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import FSBCAccount from "./server/models/FSBCAccount.js";
import authRoutes from "./server/routes/authRoutes.js";
import walletRoutes from "./server/routes/walletRoutes.js";
import cooperativeRoutes from "./server/routes/cooperativeRoutes.js";
import { FSBC_COLLECTION_ACCOUNTS } from "./server/services/dataService.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Database connection & Seeding
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('user:pass') || process.env.MONGODB_URI.includes('cluster.mongodb.net')) {
      console.log("FSBC running with durable local file-backed store (MongoDB URI not configured or placeholder).");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
    
    // Seed FSBC Accounts if they don't exist
    const count = await FSBCAccount.countDocuments();
    if (count === 0) {
      const demoAccounts = FSBC_COLLECTION_ACCOUNTS.map(a => ({
        accountNumber: a.accountNumber,
        bankName: a.bankName,
        accountName: a.accountName
      }));
      await FSBCAccount.insertMany(demoAccounts);
      console.log('Demo FSBC accounts initialized in MongoDB');
    }
  } catch (error) {
    console.error("MongoDB connection status:", error.message);
    console.log("FSBC is operating seamlessly with durable file-backed store.");
  }
};

connectDB();

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "FSBC Production Cooperative API is running",
    accountsCount: FSBC_COLLECTION_ACCOUNTS.length
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/loans", walletRoutes);
app.use("/api/cooperative", cooperativeRoutes);

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

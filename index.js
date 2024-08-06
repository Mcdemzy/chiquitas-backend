// index.js

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { UserRouter } from "./routes/user.js";
import { StockRouter } from "./routes/stock.js";
import { StaffRouter } from "./routes/staff.js";
import { WorkdoneRouter } from "./routes/workdone.js";
import { RecordRouter } from "./routes/record.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware

const corsOptions = {
  origin: ["http://localhost:5173", "https://chiquitas-ims.vercel.app"],
  credentials: true,
};

app.use(cors(corsOptions));

// Routes
app.use("/auth", UserRouter);
app.use("/stock", StockRouter);
app.use("/staffs", StaffRouter);
app.use("/workdone", WorkdoneRouter);
app.use("/record", RecordRouter);

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

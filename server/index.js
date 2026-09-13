// Entry point for the Express server. Wires up middleware and routes.

import "dotenv/config";
import express from "express";
import cors from "cors";
import summarizeRouter from "./routes/summarize.js";
import authRouter from "./routes/auth.js"
import { connectDB } from "./database/connectDB.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman) or matching allowed origins/Vercel previews
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", summarizeRouter);
app.use("/api/auth", authRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

export default app;
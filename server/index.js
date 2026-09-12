// Entry point for the Express server. Wires up middleware and routes.

import "dotenv/config";

import express from "express";
import cors from "cors";
import summarizeRouter from "./routes/summarize.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the React frontend (running on a different port/domain) to call this API.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

// Parse JSON bodies (for the "paste text" flow).
app.use(express.json({ limit: "1mb" }));

// Simple health-check endpoint — useful for confirming deployment worked.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount the main feature route under /api.
app.use("/api", summarizeRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;
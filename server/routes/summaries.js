import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Summary } from "../models/Summary.js";

const router = Router();

// GET /api/summaries, returns this user's saved summaries, newest first
router.get("/", requireAuth, async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.userId })
      .sort({ createdAt: -1 }) // newest first
      .select("fileName sourceTextPreview createdAt"); // list view only needs a preview, not the full quiz
    res.json(summaries);
  } catch (err) {
    console.error("Error fetching summaries:", err.message);
    res.status(500).json({ error: "Could not load your past summaries." });
  }
});

// GET /api/summaries/:id, returns one full summary + quiz
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const summary = await Summary.findOne({
      _id: req.params.id,
      user: req.userId, // ensures users can't fetch someone else's summary by guessing an ID
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

    res.json(summary);
  } catch (err) {
    console.error("Error fetching summary:", err.message);
    res.status(500).json({ error: "Could not load this summary." });
  }
});

export default router;
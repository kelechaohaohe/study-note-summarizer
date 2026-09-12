// Defines POST /api/summarize

import { Router } from "express";
import pdfParse from "pdf-parse";
import { upload } from "../middleware/upload.js";
import { generateSummaryAndQuiz } from "../services/llm.js";

const router = Router();

// multer's .single("file") means: look for one file under the "file" field.
// It's a no-op if the request is plain JSON with no file attached.
router.post("/summarize", upload.single("file"), async (req, res) => {
  try {
    const quizCount = Number(req.body?.quizCount) || 5;
    let text = req.body?.text || "";

    // If a file was uploaded, extract its text instead of using req.body.text.
    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
      } else {
        // text/plain
        text = req.file.buffer.toString("utf-8");
      }
    }

    // Basic input validation, reject empty or absurdly long input early.
    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        error: "Please provide at least a few sentences of notes to summarize.",
      });
    }
    if (text.length > 50_000) {
      return res.status(400).json({
        error: "Notes are too long (50,000 character limit).",
      });
    }

    const result = await generateSummaryAndQuiz(text, quizCount);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in /api/summarize:", err.message);
    return res.status(500).json({
      error: "Something went wrong generating your summary. Please try again.",
    });
  }
});

export default router;
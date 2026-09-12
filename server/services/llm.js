import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Builds the prompt that instructs the model exactly how to behave.
 * Being explicit about the JSON shape is what makes the response reliable
 * enough to parse programmatically.
 */
function buildPrompt(text, quizCount) {
  return `You are an expert tutor helping students study.
Given the study notes below, return ONLY valid JSON matching exactly this shape:

{
  "summary": "A concise, well-organized summary of the notes (150-250 words).",
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Rules:
- Generate exactly ${quizCount} quiz questions based on the notes.
- Each question must have 4 options and a zero-based correctIndex.
- "explanation" MUST be 2-3 sentences. It MUST explain:
  1) The core underlying concept behind the correct answer.
  2) Why the key distractors (incorrect choices) are wrong or invalid in this context.
- NEVER return generic statements like "The correct answer is X". Provide actual conceptual reasoning using broader computer science knowledge when helpful.
- Return raw JSON only (no markdown code fences).

Notes:
"""
${text}
"""`;
}

/**
 * Calls the Gemini API and returns a parsed { summary, quiz } object.
 * Retries once if the model's response isn't valid JSON.
 */
export async function generateSummaryAndQuiz(text, quizCount = 5) {
  const prompt = buildPrompt(text, quizCount);

  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.9,
        thinkingConfig: { thinkingLevel: "MINIMAL" },
      },
    });

    const rawText = result.text.trim();

    try {
      const parsed = JSON.parse(stripCodeFences(rawText));
      validateShape(parsed, quizCount);
      return parsed;
    } catch (err) {
      if (attempt === 2) {
        throw new Error("The AI did not return valid JSON after 2 attempts: " + err.message);
      }
    }
  }
}

/**
 * Defensive helper: some models occasionally wrap JSON in ```json fences
 * even when told not to. Strip them before parsing.
 */
function stripCodeFences(raw) {
  return raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

/**
 * Throws if the parsed object doesn't match the shape we promised the frontend.
 */
function validateShape(parsed, quizCount) {
  if (typeof parsed.summary !== "string" || !Array.isArray(parsed.quiz)) {
    throw new Error("Missing 'summary' string or 'quiz' array.");
  }
  for (const q of parsed.quiz) {
    if (
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correctIndex !== "number" ||
      typeof q.explanation !== "string" ||
      q.explanation.trim().length === 0
    ) {
      throw new Error("A quiz question has an invalid shape or missing explanation.");
    }
  }
}
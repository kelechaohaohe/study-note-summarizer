import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// Mock pdf-parse to prevent parsing issues with fake buffers during tests
vi.mock("pdf-parse", () => {
  return {
    PDFParse: class {
      getText() {
        return Promise.resolve({
          text: "Photosynthesis is the process by which green plants convert light energy into chemical energy.",
        });
      }
      destroy() {
        return Promise.resolve(true);
      }
    },
  };
});

// Mock the LLM service to include the new explanation field
vi.mock("../services/llm.js", () => ({
  generateSummaryAndQuiz: vi.fn(async (text, quizCount) => ({
    summary: "This is a fake summary for testing.",
    quiz: Array.from({ length: quizCount }, (_, i) => ({
      question: `Fake question ${i + 1}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Option A is correct because it directly matches the test concept.",
    })),
  })),
}));

const { default: app } = await import("../index.js");

describe("POST /api/summarize", () => {
  it("rejects requests with no text and no file", async () => {
    const res = await request(app).post("/api/summarize").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects text that is too short", async () => {
    const res = await request(app)
      .post("/api/summarize")
      .send({ text: "too short" });
    expect(res.status).toBe(400);
  });

  it("rejects text exceeding 50,000 characters", async () => {
    const longText = "a".repeat(50001);
    const res = await request(app)
      .post("/api/summarize")
      .send({ text: longText });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/50,000 character limit/i);
  });

  it("returns summary, quiz questions, and explanations for text input", async () => {
    const notes = "Photosynthesis is the process plants use to convert light into energy. ".repeat(3);
    const res = await request(app)
      .post("/api/summarize")
      .send({ text: notes, quizCount: 3 });

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeTypeOf("string");
    expect(res.body.quiz).toHaveLength(3);
    expect(res.body.quiz[0]).toHaveProperty("question");
    expect(res.body.quiz[0].options).toHaveLength(4);
    expect(res.body.quiz[0]).toHaveProperty("explanation");
    expect(res.body.quiz[0].explanation).toBeTypeOf("string");
  });

  it("handles plain text (.txt) file uploads successfully", async () => {
    const fileBuffer = Buffer.from("Operating systems enforce mutual exclusion to prevent race conditions in critical regions.");
    
    const res = await request(app)
      .post("/api/summarize")
      .attach("file", fileBuffer, {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(200);
    expect(res.body.quiz).toBeDefined();
    expect(res.body.quiz[0].explanation).toBeDefined();
  });

  it("handles PDF (.pdf) file uploads successfully", async () => {
    const fakePdfBuffer = Buffer.from("%PDF-1.4 fake pdf content");

    const res = await request(app)
      .post("/api/summarize")
      .attach("file", fakePdfBuffer, {
        filename: "lecture.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.quiz).toBeDefined();
  });

  it("responds to the health check", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
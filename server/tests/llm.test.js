import { describe, it, expect, vi } from "vitest";

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

// Mock @google/genai with a constructable ES Class
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      constructor() {
        this.models = {
          generateContent: mockGenerateContent,
        };
      }
    },
  };
});

import { generateSummaryAndQuiz } from "../services/llm.js";

describe("generateSummaryAndQuiz (Service Unit Test)", () => {
  it("throws an error when AI returns malformed JSON or missing explanation", async () => {
    // Return payload missing the required 'explanation' field to trigger validation error
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: "Valid summary",
        quiz: [
          {
            question: "Sample Question?",
            options: ["A", "B", "C", "D"],
            correctIndex: 0,
          },
        ],
      }),
    });

    await expect(
      generateSummaryAndQuiz("Valid sample text for summary and quiz testing.", 1)
    ).rejects.toThrow(/valid JSON after 2 attempts/i);
  });
});
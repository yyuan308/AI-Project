import { describe, expect, it } from "vitest";
import { BenchmarkDatasetSchema } from "./index.js";

describe("BenchmarkDatasetSchema", () => {
  it("accepts a mixed objective and subjective dataset", () => {
    const parsed = BenchmarkDatasetSchema.parse({
      id: "sample-mixed-basic",
      name: "Mixed Basic Sample",
      version: "0.1.0",
      sourceType: "sample",
      questions: [
        {
          id: "q1",
          type: "objective",
          subject: "history",
          text: "Which dynasty built the Grand Canal?",
          maxScore: 2,
          options: ["Qin", "Sui", "Tang", "Song"],
          correctAnswer: "Sui"
        },
        {
          id: "q2",
          type: "short_answer",
          subject: "history",
          text: "Explain one reason the Grand Canal mattered.",
          maxScore: 4,
          referenceAnswer: "It connected north and south China and improved transport of grain and goods.",
          rubric: {
            fullScore: 4,
            scoringPoints: [
              { id: "p1", description: "Mentions north-south connection", points: 2 },
              { id: "p2", description: "Mentions transport or economic value", points: 2 }
            ],
            deductionPoints: []
          }
        }
      ],
      answers: [
        { id: "a1", questionId: "q1", sourceType: "simulated", text: "Sui", humanScore: 2 },
        { id: "a2", questionId: "q2", sourceType: "simulated", text: "It helped move grain and linked regions.", humanScore: 3 }
      ]
    });

    expect(parsed.questions).toHaveLength(2);
    expect(parsed.answers).toHaveLength(2);
  });

  it("rejects an answer that references a missing question", () => {
    const result = BenchmarkDatasetSchema.safeParse({
      id: "bad-dataset",
      name: "Bad Dataset",
      version: "0.1.0",
      sourceType: "sample",
      questions: [],
      answers: [
        { id: "a1", questionId: "missing", sourceType: "simulated", text: "x", humanScore: 1 }
      ]
    });

    expect(result.success).toBe(false);
  });
});

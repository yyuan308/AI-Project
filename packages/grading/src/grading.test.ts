import { describe, expect, it } from "vitest";
import { gradeObjectiveAnswer, MockSubjectiveGrader } from "./index.js";

describe("gradeObjectiveAnswer", () => {
  it("awards full score for a normalized exact match", () => {
    const result = gradeObjectiveAnswer(
      {
        id: "q1",
        type: "objective",
        subject: "history",
        text: "Question",
        maxScore: 2,
        options: ["Sui", "Tang"],
        correctAnswer: "Sui"
      },
      { id: "a1", questionId: "q1", sourceType: "simulated", text: " sui ", humanScore: 2 }
    );

    expect(result.score).toBe(2);
    expect(result.riskLabel).toBe("low");
  });

  it("awards zero for an incorrect answer", () => {
    const result = gradeObjectiveAnswer(
      {
        id: "q1",
        type: "objective",
        subject: "history",
        text: "Question",
        maxScore: 2,
        options: ["Sui", "Tang"],
        correctAnswer: "Sui"
      },
      { id: "a1", questionId: "q1", sourceType: "simulated", text: "Tang", humanScore: 0 }
    );

    expect(result.score).toBe(0);
    expect(result.missedPoints).toContain("correct_answer");
  });
});

describe("MockSubjectiveGrader", () => {
  it("scores answers by matching rubric words and accepted expressions", async () => {
    const grader = new MockSubjectiveGrader();
    const result = await grader.grade(
      {
        id: "q2",
        type: "short_answer",
        subject: "history",
        text: "Explain one reason the Grand Canal mattered.",
        maxScore: 4,
        referenceAnswer: "It connected north and south China and improved transport.",
        rubric: {
          fullScore: 4,
          scoringPoints: [
            { id: "p1", description: "Mentions north-south connection", points: 2 },
            { id: "p2", description: "Mentions transport or economic value", points: 2 }
          ],
          deductionPoints: [],
          acceptedExpressions: ["linked regions", "moved grain"],
          notes: ""
        }
      },
      { id: "a3", questionId: "q2", sourceType: "simulated", text: "It linked regions and moved grain.", humanScore: 4 }
    );

    expect(result.score).toBeGreaterThanOrEqual(2);
    expect(result.method).toBe("mock_subjective");
  });
});

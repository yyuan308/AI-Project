import { describe, expect, it } from "vitest";
import { evaluateScores } from "./index.js";

describe("evaluateScores", () => {
  it("computes objective accuracy and subjective error metrics", () => {
    const summary = evaluateScores({
      answers: [
        { id: "a1", questionId: "q1", sourceType: "simulated", text: "Sui", humanScore: 2 },
        { id: "a2", questionId: "q1", sourceType: "simulated", text: "Tang", humanScore: 0 },
        { id: "a3", questionId: "q2", sourceType: "simulated", text: "Good answer", humanScore: 4 },
        { id: "a4", questionId: "q2", sourceType: "simulated", text: "Weak answer", humanScore: 1 }
      ],
      outputs: [
        { answerId: "a1", questionId: "q1", score: 2, maxScore: 2, method: "rule", rationale: "", matchedPoints: [], missedPoints: [], rawResponse: {}, riskLabel: "low" },
        { answerId: "a2", questionId: "q1", score: 0, maxScore: 2, method: "rule", rationale: "", matchedPoints: [], missedPoints: [], rawResponse: {}, riskLabel: "low" },
        { answerId: "a3", questionId: "q2", score: 3, maxScore: 4, method: "mock_subjective", rationale: "", matchedPoints: [], missedPoints: [], rawResponse: {}, riskLabel: "medium" },
        { answerId: "a4", questionId: "q2", score: 2, maxScore: 4, method: "mock_subjective", rationale: "", matchedPoints: [], missedPoints: [], rawResponse: {}, riskLabel: "medium" }
      ],
      severeDeviationThreshold: 2
    });

    expect(summary.objectiveAccuracy).toBe(1);
    expect(summary.subjectiveMae).toBe(1);
    expect(summary.subjectiveRmse).toBe(1);
    expect(summary.severeDeviationRate).toBe(0);
    expect(summary.overScoreCount).toBe(1);
    expect(summary.underScoreCount).toBe(1);
  });
});

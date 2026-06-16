import { describe, expect, it } from "vitest";
import { renderMarkdownReport } from "./index.js";

describe("renderMarkdownReport", () => {
  it("renders core benchmark sections and metrics", () => {
    const markdown = renderMarkdownReport({
      datasetName: "Mixed Basic Sample",
      modelName: "mock-subjective-v0",
      promptVersion: "mock-v0",
      summary: {
        objectiveAccuracy: 1,
        subjectiveMae: 1,
        subjectiveRmse: 1,
        scoreBandAgreementRate: 0.75,
        severeDeviationRate: 0,
        overScoreCount: 1,
        underScoreCount: 1
      },
      severeCases: []
    });

    expect(markdown).toContain("# AI Grading Benchmark Report");
    expect(markdown).toContain("Mixed Basic Sample");
    expect(markdown).toContain("| Objective accuracy | 1 |");
  });
});

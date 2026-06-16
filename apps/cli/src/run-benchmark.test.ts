import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runBenchmark } from "./run-benchmark.js";

describe("runBenchmark", () => {
  it("loads a dataset, grades answers, evaluates metrics, and writes a report", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aigrading-"));
    const datasetPath = join(dir, "dataset.json");
    const reportPath = join(dir, "report.md");

    await writeFile(
      datasetPath,
      JSON.stringify({
        id: "sample",
        name: "Sample",
        version: "0.1.0",
        sourceType: "sample",
        questions: [
          {
            id: "q1",
            type: "objective",
            subject: "history",
            text: "Question",
            maxScore: 2,
            options: ["Sui", "Tang"],
            correctAnswer: "Sui"
          }
        ],
        answers: [
          { id: "a1", questionId: "q1", sourceType: "simulated", text: "Sui", humanScore: 2 }
        ]
      }),
      "utf8"
    );

    await runBenchmark({ datasetPath, outPath: reportPath });
    const report = await readFile(reportPath, "utf8");

    expect(report).toContain("# AI Grading Benchmark Report");
    expect(report).toContain("Objective accuracy");

    await rm(dir, { recursive: true, force: true });
  });
});

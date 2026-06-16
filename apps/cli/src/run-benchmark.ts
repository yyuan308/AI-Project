import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Command } from "commander";
import { evaluateScores } from "@aigrading/evaluation";
import { gradeObjectiveAnswer, MockSubjectiveGrader } from "@aigrading/grading";
import { renderMarkdownReport, type SevereCase } from "@aigrading/report";
import {
  BenchmarkDatasetSchema,
  type BenchmarkDataset,
  type GradingOutput
} from "@aigrading/schemas";

export type RunBenchmarkOptions = {
  datasetPath: string;
  outPath: string;
};

async function loadDataset(path: string): Promise<BenchmarkDataset> {
  const raw = await readFile(path, "utf8");
  return BenchmarkDatasetSchema.parse(JSON.parse(raw));
}

async function gradeDataset(dataset: BenchmarkDataset): Promise<GradingOutput[]> {
  const subjectiveGrader = new MockSubjectiveGrader();
  const questionsById = new Map(dataset.questions.map((question) => [question.id, question]));
  const outputs: GradingOutput[] = [];

  for (const answer of dataset.answers) {
    const question = questionsById.get(answer.questionId);
    if (!question) {
      throw new Error(`Answer ${answer.id} references missing question ${answer.questionId}`);
    }

    if (question.type === "objective") {
      outputs.push(gradeObjectiveAnswer(question, answer));
    } else {
      outputs.push(await subjectiveGrader.grade(question, answer));
    }
  }

  return outputs;
}

function findSevereCases(dataset: BenchmarkDataset, outputs: GradingOutput[], threshold: number): SevereCase[] {
  const answersById = new Map(dataset.answers.map((answer) => [answer.id, answer]));

  return outputs.flatMap((output) => {
    const answer = answersById.get(output.answerId);
    if (!answer) {
      return [];
    }

    const delta = output.score - answer.humanScore;
    if (Math.abs(delta) < threshold) {
      return [];
    }

    return [{ answer, output, delta }];
  });
}

export async function runBenchmark(options: RunBenchmarkOptions): Promise<void> {
  const dataset = await loadDataset(options.datasetPath);
  const outputs = await gradeDataset(dataset);
  const severeDeviationThreshold = 2;
  const summary = evaluateScores({
    answers: dataset.answers,
    outputs,
    severeDeviationThreshold
  });
  const severeCases = findSevereCases(dataset, outputs, severeDeviationThreshold);

  const markdown = renderMarkdownReport({
    datasetName: dataset.name,
    modelName: "mock-subjective-v0",
    promptVersion: "mock-v0",
    summary,
    severeCases
  });

  await mkdir(dirname(options.outPath), { recursive: true });
  await writeFile(options.outPath, markdown, "utf8");
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .requiredOption("--dataset <path>", "Path to benchmark dataset JSON")
    .requiredOption("--out <path>", "Path to write Markdown report");

  program.parse(process.argv);
  const options = program.opts<{ dataset: string; out: string }>();
  await runBenchmark({ datasetPath: options.dataset, outPath: options.out });
}

if (process.argv[1]?.endsWith("run-benchmark.ts") || process.argv[1]?.endsWith("run-benchmark.js")) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}

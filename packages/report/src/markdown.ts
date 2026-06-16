import type { EvaluationSummary, GradingOutput, StudentAnswer } from "@aigrading/schemas";

export type SevereCase = {
  answer: StudentAnswer;
  output: GradingOutput;
  delta: number;
};

export type RenderMarkdownReportInput = {
  datasetName: string;
  modelName: string;
  promptVersion: string;
  summary: EvaluationSummary;
  severeCases: SevereCase[];
};

function metricRows(summary: EvaluationSummary): string {
  return [
    ["Objective accuracy", summary.objectiveAccuracy],
    ["Subjective MAE", summary.subjectiveMae],
    ["Subjective RMSE", summary.subjectiveRmse],
    ["Score-band agreement rate", summary.scoreBandAgreementRate],
    ["Severe deviation rate", summary.severeDeviationRate],
    ["Over-score count", summary.overScoreCount],
    ["Under-score count", summary.underScoreCount]
  ]
    .map(([name, value]) => `| ${name} | ${value} |`)
    .join("\n");
}

function severeCaseSection(cases: SevereCase[]): string {
  if (cases.length === 0) {
    return "No severe deviation cases were found for the configured threshold.";
  }

  return cases
    .map((item, index) => {
      return [
        `### Case ${index + 1}: ${item.answer.id}`,
        "",
        `- Question: ${item.answer.questionId}`,
        `- Human score: ${item.answer.humanScore}`,
        `- Machine score: ${item.output.score}`,
        `- Delta: ${item.delta}`,
        `- Risk: ${item.output.riskLabel}`,
        `- Rationale: ${item.output.rationale}`,
        "",
        "Answer:",
        "",
        `> ${item.answer.text}`
      ].join("\n");
    })
    .join("\n\n");
}

export function renderMarkdownReport(input: RenderMarkdownReportInput): string {
  return [
    "# AI Grading Benchmark Report",
    "",
    "## Background and Goal",
    "",
    "This report evaluates machine grading outputs against human gold scores for a mixed objective and subjective dataset.",
    "",
    "## Dataset and Run",
    "",
    `- Dataset: ${input.datasetName}`,
    `- Model or grader: ${input.modelName}`,
    `- Prompt version: ${input.promptVersion}`,
    "",
    "## Metrics",
    "",
    "| Metric | Value |",
    "| --- | ---: |",
    metricRows(input.summary),
    "",
    "## Representative Error Cases",
    "",
    severeCaseSection(input.severeCases),
    "",
    "## Suitable Use Boundaries",
    "",
    "The v0.1 loop is suitable for validating metric calculations and report shape on small datasets. Claims about real grading quality require larger anonymized real samples and real model runs.",
    "",
    "## Improvement Suggestions",
    "",
    "- Add real model adapters behind the existing subjective grader interface.",
    "- Expand datasets with more subjects and answer quality levels.",
    "- Add reviewer annotations for severe deviation cases."
  ].join("\n");
}

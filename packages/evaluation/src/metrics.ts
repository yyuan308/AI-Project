import type { EvaluationSummary, GradingOutput, StudentAnswer } from "@aigrading/schemas";

export type EvaluateScoresInput = {
  answers: StudentAnswer[];
  outputs: GradingOutput[];
  severeDeviationThreshold: number;
};

function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}

function sameScoreBand(machineScore: number, humanScore: number, maxScore: number): boolean {
  const machineBand = Math.floor((machineScore / maxScore) * 3);
  const humanBand = Math.floor((humanScore / maxScore) * 3);
  return machineBand === humanBand;
}

export function evaluateScores(input: EvaluateScoresInput): EvaluationSummary {
  const answersById = new Map(input.answers.map((answer) => [answer.id, answer]));
  const paired = input.outputs
    .map((output) => ({ output, answer: answersById.get(output.answerId) }))
    .filter((pair): pair is { output: GradingOutput; answer: StudentAnswer } => Boolean(pair.answer));

  const objectivePairs = paired.filter((pair) => pair.output.method === "rule");
  const subjectivePairs = paired.filter((pair) => pair.output.method !== "rule");

  const objectiveCorrectCount = objectivePairs.filter((pair) => pair.output.score === pair.answer.humanScore).length;
  const objectiveAccuracy = objectivePairs.length === 0 ? 0 : objectiveCorrectCount / objectivePairs.length;

  const subjectiveDiffs = subjectivePairs.map((pair) => pair.output.score - pair.answer.humanScore);
  const absoluteDiffs = subjectiveDiffs.map((diff) => Math.abs(diff));
  const squaredDiffs = subjectiveDiffs.map((diff) => diff * diff);

  const subjectiveMae = absoluteDiffs.length === 0
    ? 0
    : absoluteDiffs.reduce((sum, diff) => sum + diff, 0) / absoluteDiffs.length;

  const subjectiveRmse = squaredDiffs.length === 0
    ? 0
    : Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length);

  const scoreBandAgreementCount = paired.filter((pair) =>
    sameScoreBand(pair.output.score, pair.answer.humanScore, pair.output.maxScore)
  ).length;

  const severeDeviationCount = paired.filter((pair) =>
    Math.abs(pair.output.score - pair.answer.humanScore) >= input.severeDeviationThreshold
  ).length;

  return {
    objectiveAccuracy: roundMetric(objectiveAccuracy),
    subjectiveMae: roundMetric(subjectiveMae),
    subjectiveRmse: roundMetric(subjectiveRmse),
    scoreBandAgreementRate: paired.length === 0 ? 0 : roundMetric(scoreBandAgreementCount / paired.length),
    severeDeviationRate: paired.length === 0 ? 0 : roundMetric(severeDeviationCount / paired.length),
    overScoreCount: subjectiveDiffs.filter((diff) => diff > 0).length,
    underScoreCount: subjectiveDiffs.filter((diff) => diff < 0).length
  };
}

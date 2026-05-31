import type { GradingOutput, StudentAnswer, SubjectiveQuestion } from "@aigrading/schemas";

export interface SubjectiveGrader {
  grade(question: SubjectiveQuestion, answer: StudentAnswer): Promise<GradingOutput>;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function hasKeywordOverlap(description: string, answerText: string): boolean {
  const descriptionWords = normalize(description)
    .split(/[^a-z0-9]+/u)
    .filter((word) => word.length >= 5);

  return descriptionWords.some((word) => normalize(answerText).includes(word));
}

export class MockSubjectiveGrader implements SubjectiveGrader {
  async grade(question: SubjectiveQuestion, answer: StudentAnswer): Promise<GradingOutput> {
    const matchedPoints: string[] = [];
    const missedPoints: string[] = [];
    let score = 0;

    for (const point of question.rubric.scoringPoints) {
      const expressionMatched = question.rubric.acceptedExpressions.some((expression) =>
        normalize(answer.text).includes(normalize(expression))
      );
      const pointMatched = hasKeywordOverlap(point.description, answer.text);

      if (expressionMatched || pointMatched) {
        matchedPoints.push(point.id);
        score += point.points;
      } else {
        missedPoints.push(point.id);
      }
    }

    const cappedScore = Math.min(score, question.maxScore);
    const riskLabel = matchedPoints.length === 0 ? "high" : missedPoints.length > 0 ? "medium" : "low";

    return {
      answerId: answer.id,
      questionId: question.id,
      score: cappedScore,
      maxScore: question.maxScore,
      method: "mock_subjective",
      rationale: `Matched ${matchedPoints.length} rubric point(s) and missed ${missedPoints.length}.`,
      matchedPoints,
      missedPoints,
      rawResponse: {
        grader: "MockSubjectiveGrader",
        answerText: answer.text
      },
      riskLabel
    };
  }
}

import type { GradingOutput, ObjectiveQuestion, StudentAnswer } from "@aigrading/schemas";

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

export function gradeObjectiveAnswer(question: ObjectiveQuestion, answer: StudentAnswer): GradingOutput {
  const isCorrect = normalizeAnswer(answer.text) === normalizeAnswer(question.correctAnswer);

  return {
    answerId: answer.id,
    questionId: question.id,
    score: isCorrect ? question.maxScore : 0,
    maxScore: question.maxScore,
    method: "rule",
    rationale: isCorrect
      ? "Answer matches the correct option after normalization."
      : "Answer does not match the correct option after normalization.",
    matchedPoints: isCorrect ? ["correct_answer"] : [],
    missedPoints: isCorrect ? [] : ["correct_answer"],
    rawResponse: { correctAnswer: question.correctAnswer, submittedAnswer: answer.text },
    riskLabel: "low"
  };
}

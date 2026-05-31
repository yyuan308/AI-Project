import { z } from "zod";

export const SourceTypeSchema = z.enum(["sample", "real_anonymized", "simulated"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const QuestionTypeSchema = z.enum(["objective", "short_answer", "humanities_subjective"]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const ScoringPointSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  points: z.number().nonnegative()
});
export type ScoringPoint = z.infer<typeof ScoringPointSchema>;

export const DeductionPointSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  points: z.number().nonnegative()
});
export type DeductionPoint = z.infer<typeof DeductionPointSchema>;

export const RubricSchema = z.object({
  fullScore: z.number().positive(),
  scoringPoints: z.array(ScoringPointSchema).min(1),
  deductionPoints: z.array(DeductionPointSchema).default([]),
  acceptedExpressions: z.array(z.string()).default([]),
  notes: z.string().default("")
});
export type Rubric = z.infer<typeof RubricSchema>;

const BaseQuestionSchema = z.object({
  id: z.string().min(1),
  subject: z.string().min(1),
  text: z.string().min(1),
  maxScore: z.number().positive()
});

export const ObjectiveQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("objective"),
  options: z.array(z.string().min(1)).min(2),
  correctAnswer: z.string().min(1)
});
export type ObjectiveQuestion = z.infer<typeof ObjectiveQuestionSchema>;

const BaseSubjectiveQuestionSchema = BaseQuestionSchema.extend({
  referenceAnswer: z.string().min(1),
  rubric: RubricSchema
});

export const ShortAnswerQuestionSchema = BaseSubjectiveQuestionSchema.extend({
  type: z.literal("short_answer")
});

export const HumanitiesSubjectiveQuestionSchema = BaseSubjectiveQuestionSchema.extend({
  type: z.literal("humanities_subjective")
});

export const SubjectiveQuestionSchema = z.union([
  ShortAnswerQuestionSchema,
  HumanitiesSubjectiveQuestionSchema
]);
export type SubjectiveQuestion = z.infer<typeof SubjectiveQuestionSchema>;

export const QuestionSchema = z.discriminatedUnion("type", [
  ObjectiveQuestionSchema,
  ShortAnswerQuestionSchema,
  HumanitiesSubjectiveQuestionSchema
]);
export type Question = z.infer<typeof QuestionSchema>;

export const StudentAnswerSchema = z.object({
  id: z.string().min(1),
  questionId: z.string().min(1),
  sourceType: z.enum(["real_anonymized", "simulated"]),
  text: z.string(),
  humanScore: z.number().nonnegative()
});
export type StudentAnswer = z.infer<typeof StudentAnswerSchema>;

export const BenchmarkDatasetSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),
    sourceType: SourceTypeSchema,
    questions: z.array(QuestionSchema).min(1),
    answers: z.array(StudentAnswerSchema).min(1)
  })
  .superRefine((dataset, ctx) => {
    const questionIds = new Set(dataset.questions.map((question) => question.id));
    for (const answer of dataset.answers) {
      if (!questionIds.has(answer.questionId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Answer ${answer.id} references missing question ${answer.questionId}`,
          path: ["answers"]
        });
      }
    }
  });
export type BenchmarkDataset = z.infer<typeof BenchmarkDatasetSchema>;

export type GradingOutput = {
  answerId: string;
  questionId: string;
  score: number;
  maxScore: number;
  method: "rule" | "mock_subjective" | "model";
  rationale: string;
  matchedPoints: string[];
  missedPoints: string[];
  rawResponse: unknown;
  riskLabel: "low" | "medium" | "high";
};

export type EvaluationSummary = {
  objectiveAccuracy: number;
  subjectiveMae: number;
  subjectiveRmse: number;
  scoreBandAgreementRate: number;
  severeDeviationRate: number;
  overScoreCount: number;
  underScoreCount: number;
};

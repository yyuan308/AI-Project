# AI Grading Benchmark System Design

Date: 2026-05-28

## 1. Project Goal

The project has two final outputs:

1. An automatic grading website for evaluating AI grading capability.
2. A benchmark report that measures how well AI models perform in grading scenarios.

The first phase focuses on short-answer and humanities-style subjective questions, plus mixed objective questions. The website is not primarily a student-facing homework product. It is an administrator and researcher tool for importing datasets, running AI grading experiments, comparing AI scores against human scores, analyzing errors, and generating benchmark reports.

The project should start with a working evaluation loop, then evolve into a more complete internal platform.

## 2. Scope

### In Scope

- Dataset import for questions, reference answers, rubrics, student answers, and human scores.
- Objective-question grading through deterministic rules.
- Subjective-question grading through AI model calls and rubric-based prompts.
- Model and prompt-version tracking for each grading run.
- Evaluation metrics comparing AI scores with human gold scores.
- Error analysis for over-scoring, under-scoring, severe deviation, rubric misses, and inconsistent reasoning.
- A web console for administrators and researchers.
- Exportable benchmark report in Markdown, HTML, or PDF.
- Training materials for agentic coding, GitHub workflow, website usage, and AI grading evaluation methods.

### Out of Scope for v0.1

- Student-facing answer submission portal.
- Full teacher workflow for assigning exams and managing classes.
- Production-grade permission management.
- Large-scale multi-tenant deployment.
- Fully automated data labeling without human review.

These can be added after the benchmark loop is proven.

## 3. Delivery Stages

### v0.1: Benchmark Loop

Goal: prove the core evaluation workflow.

Capabilities:

- Import a small mixed dataset.
- Grade objective questions by rules.
- Grade subjective questions by AI model.
- Compare AI scores against human scores.
- Generate basic metrics and error cases.
- Produce a first benchmark report.

### v0.2: Usable Research Website

Goal: make the system comfortable for repeated internal evaluation.

Capabilities:

- Dataset management UI.
- Evaluation task management.
- Result dashboard.
- Question-level and model-level analysis.
- Manual review console for error cases.
- Report export workflow.

### v1.0: Benchmark Platform

Goal: support more rigorous and reusable AI grading studies.

Capabilities:

- Multiple datasets.
- Multiple models.
- Multiple prompt and rubric versions.
- Stable benchmark methodology.
- Repeatable experiment tracking.
- Formal benchmark reports.

## 4. Users

### Primary Users

- Project administrator.
- AI grading researcher.
- Developer evaluating model and prompt behavior.

### Secondary Users

- Teacher or domain expert providing rubrics and human scores.
- Reviewer validating error cases.

Students are not first-phase users.

## 5. System Modules

### 5.1 Dataset Manager

Purpose: manage the source data used for grading and evaluation.

Responsibilities:

- Import CSV or Excel files.
- Validate required fields.
- Store questions, options, standard answers, rubrics, student answers, and human scores.
- Separate public sample datasets from private real datasets.

Expected v0.1 input types:

- Objective question.
- Short-answer subjective question.
- Humanities-style subjective question.

### 5.2 Rubric Manager

Purpose: represent how subjective answers should be graded.

Responsibilities:

- Store full score, scoring points, deduction points, accepted expressions, and reference answers.
- Version rubric changes.
- Provide structured rubric content to grading prompts.

The rubric should be understandable by both human reviewers and AI prompts.

### 5.3 Grading Engine

Purpose: produce AI or rule-based grading outputs.

Responsibilities:

- Grade objective questions using deterministic answer matching.
- Grade subjective questions using model calls.
- Preserve model name, prompt version, rubric version, score, reason, raw response, and runtime metadata.
- Mark uncertain or risky grading outputs for later review.

Subjective grading output should include:

- Score.
- Short rationale.
- Matched scoring points.
- Missed or weak points.
- Confidence or risk label when available.

### 5.4 Evaluation Engine

Purpose: measure model performance against human gold scores.

Responsibilities:

- Compare AI scores with human scores.
- Compute objective-question accuracy.
- Compute subjective-question metrics.
- Identify severe deviations.
- Group results by model, prompt, dataset, subject, question type, and question.

Initial metrics:

- Accuracy for objective questions.
- MAE for subjective scores.
- RMSE for subjective scores.
- Correlation with human scores.
- Score-band agreement rate.
- Severe deviation rate.
- Over-score and under-score counts.

### 5.5 Review Console

Purpose: help users inspect typical AI grading failures.

Responsibilities:

- Show answer text, reference answer, rubric, human score, AI score, and AI rationale together.
- Filter by high error, over-score, under-score, question, model, and prompt.
- Let reviewers annotate error reasons.

Error categories:

- Over-scoring.
- Under-scoring.
- Rubric point missed.
- Irrelevant but fluent rationale.
- Expression diversity misjudged.
- Inconsistent grading for similar answers.

### 5.6 Benchmark Report Generator

Purpose: turn evaluation results into a readable report.

Responsibilities:

- Generate a structured report from one or more evaluation runs.
- Include metrics, charts or tables, and representative error cases.
- Record dataset scope, model versions, prompt versions, and limitations.

Recommended report structure:

1. Background and goals.
2. Dataset description.
3. Question types and scoring rules.
4. Evaluated models and prompt settings.
5. Evaluation metrics.
6. Overall results.
7. Results by question type.
8. Representative error cases.
9. Suitable use boundaries.
10. Improvement suggestions.
11. Future work.

### 5.7 Admin and Research Website

Purpose: provide the main operating interface.

Core pages:

- Dataset list and import.
- Dataset detail.
- Rubric detail.
- Evaluation run creation.
- Evaluation run result dashboard.
- Error case review.
- Benchmark report export.

The interface should be practical and data-oriented. It should prioritize clear tables, filters, status indicators, and drill-down views over marketing-style visuals.

## 6. Data Model Draft

### Dataset

- id
- name
- description
- source type: sample, real anonymized, simulated
- created at
- version

### Question

- id
- dataset id
- question text
- question type: objective, short_answer, humanities_subjective
- subject
- max score
- reference answer
- options, for objective questions
- correct answer, for objective questions
- rubric id, for subjective questions

### Rubric

- id
- question id
- version
- full score
- scoring points
- deduction points
- accepted expressions
- notes

### Student Answer

- id
- dataset id
- question id
- answer text
- source type: real anonymized, simulated
- metadata

### Human Score

- id
- answer id
- score
- reviewer id or label
- review notes
- created at

### Grading Run

- id
- dataset id
- model name
- prompt version
- rubric version
- status
- started at
- completed at

### AI Score

- id
- grading run id
- answer id
- score
- rationale
- matched points
- missed points
- raw model response
- risk label
- created at

### Evaluation Result

- id
- grading run id
- metric name
- metric value
- grouping fields
- created at

## 7. Repository Structure

The first repository should be a monorepo:

```text
ai-grading-benchmark/
  apps/
    web/                 # Admin and research website
    api/                 # Backend API
  packages/
    grading/             # Objective and subjective grading logic
    evaluation/          # Metrics and error analysis
    schemas/             # Shared data schemas and validation
    report/              # Benchmark report generation
  datasets/
    samples/             # Public sample datasets
    private/             # Local anonymized real data, ignored by Git
  experiments/
    prompts/             # Prompt versions
    runs/                # Experiment notes and selected outputs
  docs/
    training/            # Training materials
    specs/               # Product and technical specs
    reports/             # Benchmark reports
  .github/
    ISSUE_TEMPLATE/
    workflows/
```

The current workspace can become this repository root. Private data must be excluded from Git.

## 8. GitHub Workflow

This project is led by one person, so the process should stay lightweight while preserving professional engineering habits.

Branches:

- `main`: stable and demo-ready.
- `feature/<module-name>`: feature work, such as `feature/dataset-import`.
- `eval/<experiment-name>`: prompt and model evaluation work.
- `docs/<topic>`: training, report, and design documentation.

Issues:

- One issue should represent one clear deliverable.
- Issues should be grouped by milestones: `v0.1`, `v0.2`, and `v1.0`.
- Each issue should include goal, scope, acceptance criteria, and test notes.

Pull requests:

- Each non-trivial change should go through a PR, even when working alone.
- PR descriptions should include what changed, how it was tested, and known limitations.
- Before merge, the author should perform a self-review.

Tags:

- `v0.1-benchmark-loop`
- `v0.2-web-console`
- `v1.0-baseline-report`

## 9. Training Plan

Training is part of the project output because the system will be developed with AI assistance and GitHub workflow.

### Topic 1: Agentic Coding

Goals:

- Learn how to ask an AI coding agent to inspect a project, propose changes, implement features, run tests, and explain trade-offs.
- Learn how to keep the agent bounded by issues, specs, and tests.

Practice:

- Turn a feature idea into an issue.
- Ask the agent to inspect files before changing code.
- Ask the agent to implement and verify one small feature.

### Topic 2: Git and GitHub Workflow

Goals:

- Use branch-based development.
- Write useful commits.
- Use PRs for self-review.
- Use tags for milestones.

Practice:

- Create an issue.
- Create a feature branch.
- Commit a small change.
- Open a PR.
- Write test notes.
- Merge and tag a milestone.

### Topic 3: AI Grading Evaluation

Goals:

- Understand rubrics, gold scores, model scores, and evaluation metrics.
- Understand why subjective grading needs error analysis, not only average score difference.

Practice:

- Design a rubric for one subjective question.
- Compare AI score and human score.
- Classify errors.

### Topic 4: Website Usage

Goals:

- Use the website to import data, create evaluation runs, inspect results, review errors, and export reports.

Practice:

- Import a sample dataset.
- Run one model evaluation.
- Inspect severe deviations.
- Export a report.

## 10. Suggested Milestones

The original 4-week idea should be treated as a v0.1 rhythm, not a hard deadline.

### Milestone 1: Project Foundation

Deliverables:

- Repository initialized.
- README draft.
- Issue and PR templates.
- Dataset format specification.
- Rubric format specification.
- First sample dataset plan.

### Milestone 2: Data and Grading Loop

Deliverables:

- Sample dataset import.
- Objective grading logic.
- Subjective AI grading logic.
- Prompt version tracking.
- Stored grading outputs.

### Milestone 3: Evaluation and Error Analysis

Deliverables:

- Metric calculation.
- Severe-deviation detection.
- Error case list.
- Model and prompt comparison table.

### Milestone 4: Website MVP

Deliverables:

- Dataset import page.
- Evaluation run page.
- Result dashboard.
- Error review page.
- Basic report export.

### Milestone 5: First Benchmark Report

Deliverables:

- One completed evaluation run.
- Metrics table.
- Error case analysis.
- Report in `docs/reports/`.
- Demo script.

## 11. Risks and Mitigations

### Risk: Real Data Availability

Mitigation: use a mixed strategy. Start with simulated samples and add a small number of anonymized real answers as calibration data.

### Risk: Subjective Grading Ambiguity

Mitigation: write explicit rubrics and require human gold scores. Report uncertainty and severe deviations instead of claiming perfect grading.

### Risk: Prompt Overfitting

Mitigation: keep separate sample sets for development and benchmark reporting. Track prompt versions and avoid tuning only on final benchmark cases.

### Risk: Report Credibility

Mitigation: disclose dataset size, source, limitations, model versions, and prompt settings. Include representative error cases.

### Risk: Building Too Much Product Too Early

Mitigation: prioritize the evaluation loop before teacher-facing or student-facing workflows.

## 12. Success Criteria

v0.1 is successful when:

- A mixed dataset can be imported.
- Objective and subjective questions can both be graded.
- AI scores can be compared with human scores.
- At least five meaningful evaluation metrics are produced.
- Severe error cases can be inspected.
- A benchmark report can be generated.
- The repository contains clear documentation and GitHub workflow templates.

## 13. First Implementation Direction

The first implementation plan should focus on the project foundation and v0.1 benchmark loop:

1. Create repository structure.
2. Add README, issue templates, PR template, and `.gitignore`.
3. Define dataset and rubric schemas.
4. Create sample data.
5. Implement objective grading.
6. Implement a first subjective grading adapter.
7. Implement metric calculation.
8. Add a minimal web interface or CLI-to-web bridge for running and inspecting evaluations.
9. Generate the first report from a sample run.

No student-facing features should be implemented before this loop works.

# AI Grading Benchmark

This repository contains an automatic grading benchmark system for mixed objective and short-answer subjective questions.

## v0.1 Goal

The first milestone builds a repeatable benchmark loop:

1. Load a mixed dataset.
2. Grade objective answers with deterministic rules.
3. Grade subjective answers through a grader interface.
4. Compare machine scores with human scores.
5. Generate a Markdown benchmark report.

## Quick Start

```bash
pnpm install
pnpm test
pnpm benchmark:sample
```

The sample report is written to `docs/reports/v0.1-sample-report.md`.

## Private Data

Put anonymized real datasets under `datasets/private/`. That folder is ignored by Git.

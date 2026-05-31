# AI Grading Benchmark Project Status

Last updated: 2026-05-31

## Current State

The project is implementing the v0.1 benchmark loop from:

- `docs/superpowers/specs/2026-05-28-ai-grading-benchmark-design.md`
- `docs/superpowers/plans/2026-05-28-v0.1-benchmark-loop.md`

The workflow is:

1. Work on one task branch.
2. Commit the task.
3. Push the branch to GitHub.
4. Open and merge a PR into `main`.
5. Start the next task from updated `main`.

Remote repository:

- `https://github.com/yyuan308/AI-Project.git`

Use PowerShell command `pnpm.cmd` on this machine.

## Completed Tasks

### Task 1: Workspace Foundation

Status: merged to `main`

Branch:

- `feature/workspace-foundation`

Key output:

- Root monorepo setup.
- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `.gitignore`
- `README.md`
- GitHub issue and PR templates.

### Task 2: Shared Schemas and Sample Dataset

Status: merged to `main`

Branch:

- `feature/dataset-schemas`

Key output:

- `packages/schemas`
- Dataset, question, rubric, answer, grading output, and evaluation summary types.
- `datasets/samples/mixed-basic.json`

Important files:

- `packages/schemas/src/index.ts`
- `packages/schemas/src/index.test.ts`
- `datasets/samples/mixed-basic.json`

### Task 3: Grading Package

Status: merged to `main`

Branch:

- `feature/grading-package`

Key output:

- `packages/grading`
- Objective grading function.
- Mock subjective grader.

Important files:

- `packages/grading/src/objective.ts`
- `packages/grading/src/subjective.ts`
- `packages/grading/src/grading.test.ts`

### Task 4: Evaluation Metrics Package

Status: branch pushed; PR should be merged next if review is complete

Branch:

- `feature/evaluation-metrics`

Latest task commit:

- `77e776c feat: add benchmark evaluation metrics`

Key output:

- `packages/evaluation`
- `evaluateScores()` metric function.

Implemented metrics:

- Objective accuracy.
- Subjective MAE.
- Subjective RMSE.
- Score-band agreement rate.
- Severe deviation rate.
- Over-score count.
- Under-score count.

Important files:

- `packages/evaluation/src/metrics.ts`
- `packages/evaluation/src/metrics.test.ts`
- `packages/evaluation/src/index.ts`

Verification passed:

```powershell
pnpm.cmd --filter @aigrading/evaluation test
pnpm.cmd --filter @aigrading/evaluation typecheck
pnpm.cmd --filter @aigrading/evaluation build
pnpm.cmd test
pnpm.cmd typecheck
```

## Next Task

Next planned task:

- Task 5: Markdown Report Package

Start only after Task 4 is merged into `main`.

Expected branch:

- `feature/markdown-report`

Expected output:

- `packages/report`
- Markdown benchmark report renderer.
- Report tests.
- `docs/reports/.gitkeep`

## Local Environment Notes

Node is installed.

`pnpm@9.1.4` was installed globally. In PowerShell, use:

```powershell
pnpm.cmd --version
pnpm.cmd test
pnpm.cmd typecheck
```

Direct `pnpm` may fail in PowerShell if script execution policy blocks `pnpm.ps1`.

## Recovery Instructions

If a future Codex session cannot restore context:

1. Open this file first.
2. Check current branch:

```powershell
git status --short --branch
```

3. Sync `main` before starting a new task:

```powershell
git switch main
git pull --ff-only origin main
```

4. Read the implementation plan:

```powershell
notepad docs\superpowers\plans\2026-05-28-v0.1-benchmark-loop.md
```

5. Continue with the next unfinished task.

# Agentic Coding and GitHub Workflow

## Working Rhythm

1. Start from a written issue or implementation-plan task.
2. Sync `main` from GitHub.
3. Create a focused task branch.
4. Ask the coding agent to inspect relevant files before editing.
5. Write or update tests first for code changes.
6. Implement the smallest passing change.
7. Run tests, type checks, and builds when relevant.
8. Commit with a clear message.
9. Push the branch and open a pull request for self-review.
10. Merge into `main`, then start the next task from updated `main`.

## Branch Naming

Use this format:

```text
feature/<short-task-name>_taskN
```

Examples:

- `feature/workspace-foundation_task1`
- `feature/dataset-schemas_task2`
- `feature/grading-package_task3`
- `feature/evaluation-metrics_task4`
- `feature/markdown-report_task5`
- `feature/cli-benchmark-runner_task6`
- `feature/training-notes_task7`

Use `eval/<experiment-name>` for experiment-only branches that compare prompts, datasets, or model settings.

## Before Starting a Task

Run:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/<short-task-name>_taskN
```

Check the current plan:

```powershell
notepad docs\superpowers\plans\2026-05-28-v0.1-benchmark-loop.md
```

Check the current handoff status:

```powershell
notepad docs\project-status.md
```

## Agentic Coding Prompt Shape

Use this shape when asking an agent to work:

```text
Please inspect the current repository and implement Task N from the v0.1 benchmark loop plan.
Follow the existing package boundaries.
Use TDD for code changes.
Run the relevant tests and summarize the result.
Do not change unrelated files.
Use the branch format feature/<short-task-name>_taskN.
```

## PR Self-Review Checklist

- The PR maps to one task or issue.
- The changed files match the task scope.
- New code has tests.
- Test, typecheck, and build commands are listed in the PR.
- Generated files are intentional.
- `node_modules/`, `dist/`, and private datasets are not committed.
- Private or real student data is not committed.
- Review comments are resolved before merge.

## Common Verification Commands

Use PowerShell command `pnpm.cmd` on this machine:

```powershell
pnpm.cmd test
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd benchmark:sample
```

For one package:

```powershell
pnpm.cmd --filter @aigrading/schemas test
pnpm.cmd --filter @aigrading/grading test
pnpm.cmd --filter @aigrading/evaluation test
pnpm.cmd --filter @aigrading/report test
pnpm.cmd --filter @aigrading/cli test
```

## What the Agent Should Preserve

- Start from the approved design:
  - `docs/superpowers/specs/2026-05-28-ai-grading-benchmark-design.md`
- Execute the approved plan:
  - `docs/superpowers/plans/2026-05-28-v0.1-benchmark-loop.md`
- Keep the recovery note current:
  - `docs/project-status.md`
- Keep v0.1 focused on the benchmark loop:
  - dataset
  - grading
  - evaluation
  - report generation
  - CLI runner
  - training notes

Avoid adding teacher-facing, student-facing, authentication, or full web-admin features before the v0.1 loop is verified.

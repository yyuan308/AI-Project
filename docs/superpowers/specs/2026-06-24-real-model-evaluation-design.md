# v0.2 真实模型评测模块设计

日期：2026-06-24

## 1. 目标

v0.2 在 v0.1 基准测试闭环中接入真实的 OpenAI-compatible 模型服务，使系统能够：

1. 使用真实模型批改主观题。
2. 对模型响应进行严格 JSON 与业务规则校验。
3. 对可恢复错误进行重试，并记录失败。
4. 保存可复核、可重复的实验 JSON。
5. 使用现有 evaluation 和 report 模块生成指标与报告。
6. 保留 mock 模式，确保离线测试不依赖外部 API。

## 2. 范围

### 2.1 包含

- OpenAI-compatible API 适配器。
- 一次 benchmark 运行一个模型。
- 严格 JSON 模型输出及 Schema 校验。
- 单条答案最多重试 2 次。
- 单条最终失败后记录错误并继续。
- JSON 文件型实验记录。
- Prompt 文件版本管理。
- CLI 参数扩展。
- fake HTTP server 自动化测试。
- 少量样例数据的人工真实模型验证流程。

### 2.2 不包含

- 多模型并行运行。
- 数据库、任务队列或后台 worker。
- 网站管理台。
- 本地模型运行时集成。
- 教师端或学生端工作流。
- 自动提交真实学生数据或完整实验结果到 Git。

## 3. 架构

新增两个包，保留 v0.1 现有边界：

```text
packages/
  schemas/          # 数据、评分输出和实验记录 Schema
  grading/          # SubjectiveGrader 接口和评分语义
  model-adapters/   # API 调用、重试、超时和响应校验
  experiments/      # run ID、运行状态和 JSON 实验文件
  evaluation/       # 指标计算
  report/           # Markdown 报告生成
apps/
  cli/              # 参数解析和运行编排
experiments/
  prompts/          # 版本化 Prompt 文件
  runs/             # 本地实验 JSON，默认不提交
```

### 3.1 `packages/grading`

- 保留 `SubjectiveGrader` 接口。
- 定义统一评分输入和 `GradingOutput` 语义。
- 不依赖 HTTP、API key 或具体模型服务。
- 保留 `MockSubjectiveGrader` 供离线测试使用。

### 3.2 `packages/model-adapters`

- 实现 `OpenAICompatibleSubjectiveGrader`。
- 构建模型请求并读取 Prompt 模板。
- 调用 OpenAI-compatible API。
- 处理超时和可重试错误。
- 解析并校验结构化模型输出。
- 返回统一评分结果或结构化调用错误。

### 3.3 `packages/experiments`

- 创建 run ID。
- 初始化、更新和完成实验记录。
- 保存逐条结果、调用次数、延迟和错误。
- 原子写入 JSON，避免留下损坏文件。
- 不负责评分和指标计算。

### 3.4 `apps/cli`

- 解析 mock 或真实模型模式。
- 读取环境变量和 CLI 参数。
- 选择 `SubjectiveGrader` 实现。
- 编排 dataset、grading、experiments、evaluation 和 report。
- 一次运行一个模型。

## 4. 配置

### 4.1 API key

API key 只从环境变量读取：

```powershell
$env:AI_GRADING_API_KEY="..."
```

禁止把 API key 写入 Git tracked 文件、实验 JSON、报告、日志或错误消息。

### 4.2 CLI 参数

真实模型运行示例：

```powershell
pnpm.cmd benchmark:model `
  --dataset ../../datasets/samples/mixed-basic.json `
  --out ../../docs/reports/model-run.md `
  --run-dir ../../experiments/runs `
  --model your-model-name `
  --base-url https://example.com/v1 `
  --prompt ../../experiments/prompts/rubric-v1.md `
  --prompt-version rubric-v1
```

默认设置：

```text
temperature: 0
timeoutMs: 60000
maxRetries: 2
```

一次命令只运行一个模型。多模型比较通过多次运行和后续聚合实现。

## 5. Prompt 与结构化输出

Prompt 文件保存在：

```text
experiments/prompts/rubric-v1.md
```

每次模型调用包含题目、满分、参考答案、rubric 得分点、扣分点、可接受表达、学生答案和 JSON 输出要求。

模型必须返回：

```json
{
  "score": 3,
  "rationale": "答案命中了运输价值，但没有明确说明南北连接。",
  "matchedPoints": ["p2"],
  "missedPoints": ["p1"],
  "riskLabel": "medium"
}
```

### 5.1 输出校验

- `score` 必须是有限数字，且 `0 <= score <= maxScore`。
- `matchedPoints` 和 `missedPoints` 只能引用当前 rubric 中存在的 scoring point ID。
- 同一个评分点不能同时出现在两个数组中。
- `riskLabel` 只能是 `low`、`medium` 或 `high`。
- `rationale` 必须是非空字符串。
- 输出不是合法 JSON 时返回 `invalid_response`。
- JSON 字段或业务约束不合法时返回 `schema_error`。

## 6. 实验记录

每次真实模型运行生成：

```text
experiments/runs/<run-id>.json
```

### 6.1 顶层字段

```text
runId
status: running | completed | completed_with_errors | failed
datasetId
datasetVersion
provider: openai-compatible
baseUrlHost
model
promptVersion
startedAt
completedAt
settings
items
summary
```

### 6.2 Settings

```text
temperature
maxTokens
timeoutMs
maxRetries
```

### 6.3 Item

```text
answerId
questionId
status: success | failed
score
rationale
matchedPoints
missedPoints
riskLabel
attempts
latencyMs
errorCode
errorMessage
rawResponse
```

失败 item 不包含伪造分数。evaluation 只使用成功 item，并在 summary 和报告中显示失败数量。

### 6.4 Summary

```text
total
evaluated
succeeded
failed
successRate
```

### 6.5 文件安全

- `baseUrl` 只保存 host，不保存 query、token 或敏感路径。
- `rawResponse` 作为不可信外部内容保存，不执行其中的指令、链接或代码。
- `experiments/runs/*.json` 默认由 `.gitignore` 忽略。
- 需要提交的结果必须先人工脱敏并复制到明确的公开结果目录。
- 真实学生答案继续放在 `datasets/private/`，不提交 Git。

## 7. 数据流

```text
读取并校验 dataset
→ 读取 Prompt 和 promptVersion
→ 创建 running 实验记录
→ 客观题规则评分
→ 主观题调用真实模型
→ 校验 JSON 输出
→ 更新逐条实验结果
→ 计算成功结果指标
→ 生成 Markdown 报告
→ 写入最终 summary
→ 标记 completed 或 completed_with_errors
```

如果初始化前发生配置错误，不创建实验文件。如果实验已经创建，后续不可恢复错误应把状态写为 `failed`。

## 8. 错误处理与重试

### 8.1 错误类型

- `transport_error`：连接失败、连接重置、超时。
- `api_error`：HTTP 4xx 或 5xx。
- `invalid_response`：模型响应不是合法 JSON。
- `schema_error`：JSON 不满足结构或业务约束。

### 8.2 重试规则

可以重试：

- 网络错误和超时。
- HTTP 429。
- HTTP 5xx。
- `invalid_response`。
- `schema_error`。

不重试：

- HTTP 401。
- HTTP 403。
- 本地配置错误。
- dataset 或 rubric 校验错误。

最多重试 2 次，即单条答案最多尝试 3 次。格式错误重试时附加简短 JSON 修正要求，但不改变题目、答案或 rubric。

### 8.3 运行级行为

- 401 或 403 视为全局权限错误，停止整次运行并标记 `failed`。
- 单条可恢复错误最终失败后，记录该 item 并继续。
- 存在失败 item 时，完成状态为 `completed_with_errors`。
- 所有主观题均失败时仍生成实验 JSON，但不生成误导性的评分质量结论。

## 9. 报告扩展

现有报告增加：

- run ID。
- 模型名称和 Prompt 版本。
- 成功条数、失败条数和 API 成功率。
- 平均延迟。
- 失败类型汇总。

评分指标只基于成功 item 计算，并明确标注有效样本数。

## 10. 测试策略

### 10.1 单元测试

- 请求体构造和 Prompt 渲染。
- JSON 提取、解析和业务校验。
- 错误分类和重试判定。
- run ID 生成和实验状态转换。
- JSON 原子写入。

### 10.2 适配器测试

使用本地 fake HTTP server 覆盖：成功、超时、429、500、401、403、非 JSON、字段不合法、重试后成功、达到最大重试次数后失败。

自动化测试不得调用真实付费 API。

### 10.3 集成测试

使用 fake adapter 跑完整流程：

```text
dataset → grading → experiment JSON → evaluation → report
```

### 10.4 人工真实模型验证

- 使用少量公开或模拟答案。
- 通过环境变量提供 API key。
- 检查实验 JSON、错误记录和报告。
- 确认任何输出中都没有 API key。
- 不作为普通 CI 的必跑测试。

## 11. 兼容性

- `pnpm.cmd benchmark:sample` 保持可用。
- `MockSubjectiveGrader` 保持可用。
- v0.1 dataset 格式继续可读取。
- evaluation 和 report 的现有测试继续通过。
- 新字段优先通过新增结构实现，不破坏已有消费者。

## 12. 成功标准

v0.2 完成时必须满足：

1. 能通过 OpenAI-compatible API 完成一次真实主观题评分。
2. 一次命令只运行一个模型。
3. 模型输出经过严格 JSON 和业务校验。
4. 每条调用记录 attempts、latency 和成功/失败状态。
5. 可重试错误最多重试 2 次。
6. 单条最终失败不会中断整批实验。
7. 认证或权限错误会停止运行并安全记录状态。
8. API key 不进入实验 JSON、报告、日志或 Git。
9. 每次运行生成独立实验 JSON 和 Markdown 报告。
10. mock 模式与 v0.1 命令继续通过测试。

## 13. 后续阶段

v0.2 完成后再评估多模型批次、数据库、Excel 导入、人工复核、网站管理台和本地模型服务。这些能力不进入本设计的实现计划。

# LaunchOS — Autonomous Agentic Refactor Plan (v4)

This is the production refactor blueprint to evolve LaunchOS from prompt/response behavior into a **goal-driven autonomous multi-agent system**.

---

## 1) Refactored System Architecture

### A. Target architecture (goal-driven)

```text
[Mission Control Dashboard]
  ├─ Goal Input
  ├─ Agent Activity Stream
  ├─ Task Progress + Logs
  └─ Live Product Preview
          │
          ▼
[API Gateway + Auth + Tenancy]
          │
          ▼
[Autonomous Orchestration Core]
  ├─ Goal Interpreter Runtime
  ├─ Planner Runtime
  ├─ Agent Spawner
  ├─ Policy/Risk Engine
  ├─ Iteration Controller
  └─ Event Router
          │
          ▼
[Specialized Agents]
  ├─ Builder   ├─ Research   ├─ QA
  ├─ Fix       ├─ Deployment ├─ Monitor
  └─ Evaluator
          │
          ▼
[State + Memory Plane]
  ├─ Postgres (state/tasks)
  ├─ Vector Memory (semantic context)
  ├─ Object Storage (artifacts)
  └─ Event Log/Outbox (audit/replay)
          │
          ▼
[Workers + Queue + Integrations]
  ├─ Task Queue workers
  ├─ Tool connectors (Git, CI/CD, APIs)
  └─ Observability + Alerting
```

### B. Core principles

- **Goal-first operation:** system runs against desired outcomes, not isolated prompts.
- **Always-on loop:** plan → execute → evaluate → repair → re-plan until success/limit.
- **Shared memory collaboration:** all agents read/write persistent state.
- **Risk-aware autonomy:** policy engine enforces approvals for high-impact actions.
- **Full traceability:** every decision and action is event-logged.

---

## 2) Agent Orchestration Model

### A. Required agents and responsibilities

1. **Goal Interpreter Agent**
   - Converts user goal into structured objective:
     - goal statement
     - constraints
     - success metrics
     - resource budget
2. **Planner Agent**
   - Builds executable task graph (DAG), priorities, dependencies, checkpoints.
3. **Builder Agent**
   - Produces application code, infrastructure, integrations, data model.
4. **Research Agent**
   - Gathers market/competitor/domain references and implementation context.
5. **QA Agent**
   - Runs automated validation: lint, tests, integration checks, quality gates.
6. **Fix Agent**
   - Performs remediation for failed tests, regressions, and quality gate violations.
7. **Deployment Agent**
   - Promotes validated builds to preview/staging/production with rollback support.
8. **Monitor Agent**
   - Tracks runtime performance, business KPIs, and opens optimization tasks.
9. **Evaluator Agent**
   - Judges current outputs vs success criteria and decides continue/adjust/stop.

### B. Collaboration protocol

- Orchestrator owns global run state.
- Agents communicate via task contracts and event bus.
- Agents can:
  - delegate tasks
  - request missing context
  - spawn sub-agents (bounded by policy)
- Planner can recompose task graph based on Evaluator feedback.

### C. Task contract

Each `TaskNode` includes:

- `task_id`, `goal_id`, `owner_agent`
- `input_schema`, `output_schema`
- `depends_on[]`
- `acceptance_criteria[]`
- `risk_level` (L1/L2/L3)
- `timeout_s`, `max_retries`
- `rollback_strategy`

---

## 3) Execution Loop Design (Autonomous)

### Continuous loop

`Goal Input → Interpret → Plan → Execute → Evaluate → Fix/Replan → Iterate → Goal Achieved`

### Step-by-step

1. **Goal intake**
   - User submits natural-language objective.
2. **Interpretation**
   - Goal Interpreter converts objective into structured goal object.
3. **Planning**
   - Planner builds DAG with milestones and gate conditions.
4. **Execution**
   - Specialized agents execute tasks in parallel where possible.
5. **Evaluation**
   - Evaluator scores outputs against acceptance criteria + KPIs.
6. **Recovery**
   - On failure, Fix Agent remediates; Planner updates strategy.
7. **Promotion**
   - Deployment Agent deploys once gates pass.
8. **Monitoring**
   - Monitor Agent tracks telemetry and creates improvement tasks.
9. **Iteration**
   - Loop repeats until `goal_status = achieved` or budget/timeout exceeded.

### Stop conditions

- Goal achieved (all success metrics passed)
- Hard resource limit reached (cost/time/token thresholds)
- Human stop command/emergency halt

---

## 4) Memory Structure (Persistent Shared Memory)

### A. Memory domains

- **Goal Memory:** user goals, constraints, success criteria, budgets.
- **Project State Memory:** current architecture, backlog, run states, deployments.
- **Agent Output Memory:** artifacts from each agent (plans, code, test reports).
- **Task History Memory:** task execution history, retries, errors, durations.
- **Decision Memory:** rationale, confidence, alternatives, approvals.

### B. Storage mapping

- **Postgres:** canonical relational state and orchestration metadata.
- **Vector store (pgvector):** semantic retrieval for context recall.
- **Object store:** large artifacts (code bundles, docs, logs, media).
- **Event store/outbox:** append-only events for replay and audit.

### C. Required memory guarantees

- Durable writes before task handoff.
- Idempotent event consumption.
- Tenant isolation by workspace.
- Full provenance (who/what/why/when).

---

## 5) Task Scheduling System

### A. Scheduler responsibilities

- Queue ingestion from Planner output.
- Dependency-aware dispatch (DAG execution).
- Priority and risk-based routing.
- Timeout/retry/backoff handling.
- Dead-letter queue for persistent failures.

### B. Scheduling policies

- **Priority tiers:** critical, high, normal, low.
- **Concurrency controls:** per workspace + per agent type.
- **Retry policies:** exponential backoff with max retry cap.
- **Preemption:** urgent blocker tasks can interrupt lower-priority tasks.

### C. Failure handling workflow

1. Task fails.
2. Evaluator classifies failure cause (tooling, data, logic, infra).
3. Fix Agent attempts repair and reruns failed validations.
4. Planner rewrites affected subtree of task graph.
5. Orchestrator resumes from last stable checkpoint.

---

## 6) Recommended Technology Stack

### Frontend / UX

- Next.js (App Router) + React + TypeScript
- Tailwind + reusable component system
- SSE/WebSockets for live agent activity and logs
- Recharts/Visx for progress and KPI panels

### Orchestration / Services

- Node gateway (Next route handlers or Fastify)
- Python agent workers for planning/reasoning-heavy tasks
- BullMQ + Redis for queueing and scheduling (Temporal as scale-up path)
- Event outbox pattern initially; Kafka/NATS at higher scale

### Data / Memory

- PostgreSQL (or Supabase Postgres) for system state
- pgvector for semantic memory and retrieval
- S3-compatible object storage for artifacts

### Deployment / Ops

- Dockerized workers + CI/CD pipelines
- Environment promotion: preview → staging → production
- Observability: OpenTelemetry + Grafana + Sentry
- Feature flags + analytics: PostHog

### AI runtime strategy

- Multi-model routing by task type (reasoning/coding/summarization)
- Budget and token quotas by workspace tier
- Fallback routing for model/provider outages

---

## 7) Implementation Steps (Production Rollout)

### Phase 1: Orchestration foundation

1. Introduce shared contracts:
   - `GoalObject`, `TaskNode`, `AgentRun`, `EventEnvelope`, `RiskLevel`
2. Build orchestration core:
   - scheduler, policy engine, retry manager, event publisher
3. Add persistent memory tables and outbox event dispatcher

### Phase 2: Agent runtime enablement

4. Implement Goal Interpreter + Planner agents first
5. Add Builder, QA, Fix, Evaluator agents with tool adapters
6. Add Deployment + Monitor agents and approval gates

### Phase 3: Autonomous loop + dashboard

7. Implement continuous loop controller:
   - evaluate → fix/replan → resume
8. Build Mission Control dashboard modules:
   - Goal Input
   - Agent Activity Stream
   - Task Progress Tracker
   - System Logs
   - Live Product Preview

### Phase 4: Hardening and scale

9. Add governance controls (approval policies, emergency stop, budget limits)
10. Add reliability patterns (idempotency keys, DLQ, checkpoint recovery)
11. Add optimization engine for monitor-triggered improvement tasks

### Phase 5: KPI-driven optimization

12. Track system metrics:
    - goal completion rate
    - autonomous completion rate
    - average iterations to success
    - mean time to first deploy
    - human interventions per run
13. Use KPI feedback to tune planner/scheduler policies continuously

---

## Modular folder structure (recommended)

```text
app/
  dashboard/
    goal-input/
    agent-stream/
    progress/
    logs/
    preview/

core/
  orchestrator/
  scheduler/
  policy/
  events/
  memory/

domains/
  goal-interpreter/
  planner/
  builder/
  research/
  qa/
  fix/
  deployment/
  monitor/
  evaluator/

workers/
  orchestrator-runner/
  agent-runner/
  qa-runner/
  deploy-runner/
  monitor-runner/

integrations/
  vcs/
  cicd/
  analytics/
  notifications/
  external-apis/

prisma/
  schema.prisma
  migrations/
```

---

**Final outcome:** LaunchOS operates as a **team of autonomous AI agents** that continuously plan, execute, evaluate, self-correct, deploy, and improve toward user goals with minimal human prompting.

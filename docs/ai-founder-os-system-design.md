# LaunchOS AI Founder OS — Production System Design

## 1) Refactored System Architecture

LaunchOS evolves from a single-flow generation app into a **multi-agent business operating system** with explicit bounded contexts and event-driven orchestration.

### A. Layered architecture

1. **Experience Layer (Mission Control UI)**
   - Idea intake, objective configuration, confidence/constraints input.
   - Real-time agent activity stream and approvals queue.
   - Build preview (web/app/API), analytics command center, growth cockpit.

2. **Orchestration Layer (Agent Runtime + Workflow Engine)**
   - Goal-to-plan decomposition.
   - Agent task routing, retry policies, compensation, and guardrails.
   - Shared memory read/write policies and execution provenance.

3. **Capability Layer (Domain Services)**
   - Market intelligence, product planning, code generation, QA, deploy, growth, CRM operations.
   - Connectors to Stripe, email, ads, SEO tools, analytics, CRM, and support tools.

4. **Data + Knowledge Layer**
   - Postgres (transactional state).
   - Vector store (long-term semantic memory).
   - Object storage (artifacts: specs, assets, build outputs).
   - Event store (append-only audit + replay).

5. **Delivery + Runtime Layer**
   - Containerized services + queue workers.
   - Serverless jobs for burst workloads.
   - Observability stack (metrics, logs, traces, eval dashboards).

### B. Core bounded contexts

- **Identity & Tenancy**: users, workspaces, roles, usage limits.
- **Goal Intake**: business objective, constraints, vertical selection.
- **Planning**: milestones, dependencies, acceptance criteria, budgets.
- **Build System**: code generation, infra templates, deploy pipelines.
- **Business Ops**: offers, pricing, CRM, campaigns, automations.
- **Insights**: KPI telemetry, diagnostics, recommendations.

### C. High-level flow

`Goal Submitted → Founder Plan → Multi-Agent Execution Graph → QA Gates → Deployment → Growth Activation → Continuous Monitoring → Autonomous Improvement Proposals`

---

## 2) Agent Orchestration Design

### A. Agent topology

- **Founder Agent (Conductor)**
  - Converts user intent into business objective tree, success metrics, and operating constraints.
- **Product Architect Agent**
  - Produces target architecture, roadmap, milestones, API contracts.
- **Builder Agent**
  - Generates app/services, infrastructure configs, DB migrations, integrations.
- **UX Agent**
  - Produces IA, user flows, UI specs, component decisions, copy variants.
- **QA Agent**
  - Creates/executes tests, validates acceptance criteria, enforces release gate.
- **Growth Agent**
  - Launches positioning, channels, content pipeline, offer experiments.
- **Operations Agent**
  - Configures automations, CRM workflows, notifications, support playbooks.
- **Monitor Agent**
  - Tracks KPI drift/anomalies, opens optimization tasks, suggests expansions.

### B. Shared memory model

- **Working Memory**: per-run context (objective, plan, active blockers).
- **Long-Term Business Memory**: persistent strategy, customer signals, brand voice.
- **Artifact Memory**: specs, code snapshots, campaign assets, experiments.
- **Decision Log**: rationale, alternatives, confidence score, owner agent.

### C. Coordination protocol

- All tasks represented as a DAG (`TaskNode`) with:
  - owner agent
  - inputs/outputs schema
  - dependencies
  - quality gates
  - rollback strategy
- Event bus topics:
  - `goal.created`
  - `plan.approved`
  - `task.started|completed|failed`
  - `qa.gate.passed|blocked`
  - `deploy.completed`
  - `monitor.alert`
  - `improvement.proposed`

### D. Autonomy controls

- **Policy engine** by workspace tier:
  - fully autonomous / approval-required / advisory-only modes.
- **Risk classes**:
  - low-risk (copy edits), medium-risk (pricing update), high-risk (prod schema changes).
- **Human-in-the-loop points**:
  - legal-sensitive claims, payment policy changes, irreversible data ops.

---

## 3) Recommended Tech Stack

### Frontend

- Next.js (App Router) + React + TypeScript
- Tailwind + shadcn/ui (or equivalent component system)
- Realtime state via server events/websockets for agent activity stream
- Charting via Recharts/Visx for KPI and funnel visualization

### Backend & orchestration

- **API gateway**: Next.js route handlers or Fastify (Node)
- **Agent runtime**: Python services for planning/reasoning heavy tasks
- **Workflow engine**: Temporal or BullMQ + Redis (start with BullMQ, upgrade path to Temporal)
- **Queue**: Redis streams or RabbitMQ
- **Event bus**: Kafka (scale) or Postgres outbox pattern (early stage)

### Data

- Postgres (primary relational store)
- Supabase (managed Postgres + auth/storage option) or Neon + custom auth
- Vector DB: pgvector (initial) → dedicated vector store as scale grows
- Object storage: S3-compatible bucket for artifacts

### DevOps

- Docker + Terraform for infra reproducibility
- Deploy: Vercel (frontend) + Fly/Render/ECS for workers and Python services
- Observability: OpenTelemetry + Grafana + Sentry
- Feature flags: PostHog or LaunchDarkly

### AI providers and model strategy

- Multi-model routing:
  - planning/reasoning model
  - coding-optimized model
  - summarization/cost-efficient model
- Provider abstraction layer with fallback + token budget policies.

---

## 4) Product Roadmap (90-day execution)

### Phase 1 (Weeks 1–3): Foundation

- Introduce explicit multi-agent task graph execution.
- Add shared memory primitives (working + artifact + decisions).
- Build Mission Control dashboard (goal, progress, agent activity).

### Phase 2 (Weeks 4–6): End-to-end business generation

- Goal → strategy → product architecture → MVP code skeleton.
- Auto-generate: landing page, pricing, checkout flow, CRM pipeline.
- Integrate baseline analytics and conversion events.

### Phase 3 (Weeks 7–9): Autonomous operations

- QA agent gates (unit/e2e/lint/security checks).
- One-click deploy pipeline with rollback.
- Growth agent campaign generation + experiment loop.

### Phase 4 (Weeks 10–12): Vertical kits + intelligence

- Ship NotaryOS, Local Service Kit, Faith Creator Kit.
- Add monitor-led weekly optimization report and expansion suggestions.
- Introduce confidence scoring and autonomy policy controls.

---

## 5) Database Schema Outline

### Core entities

- `workspaces`
- `users`
- `workspace_members`
- `goals`
- `business_plans`
- `agent_runs`
- `tasks`
- `task_dependencies`
- `artifacts`
- `deployments`
- `kpi_metrics`
- `campaigns`
- `experiments`
- `crm_contacts`
- `automations`
- `monitor_alerts`
- `improvement_recommendations`

### Minimal table specs

- **goals**
  - `id`, `workspace_id`, `title`, `problem_statement`, `target_customer`, `constraints_json`, `status`
- **agent_runs**
  - `id`, `goal_id`, `agent_type`, `input_json`, `output_json`, `status`, `started_at`, `ended_at`
- **tasks**
  - `id`, `goal_id`, `owner_agent`, `type`, `priority`, `risk_level`, `state`, `acceptance_criteria_json`
- **artifacts**
  - `id`, `goal_id`, `task_id`, `kind`, `uri`, `version`, `checksum`, `metadata_json`
- **kpi_metrics**
  - `id`, `workspace_id`, `metric_key`, `metric_value`, `period_start`, `period_end`, `source`
- **improvement_recommendations**
  - `id`, `workspace_id`, `trigger_type`, `recommendation`, `estimated_impact`, `confidence`, `status`

---

## 6) UI Layout (Mission Control)

### Primary navigation

1. **Command Center** (default)
2. **Agent Console**
3. **Product Studio**
4. **Growth Engine**
5. **Operations**
6. **Analytics & Intelligence**
7. **Settings / Autonomy Policies**

### Command Center layout

- **Top bar**: workspace, objective selector, autonomy mode, run controls.
- **Left column**: idea input + constraints + vertical kit selection.
- **Center**: execution timeline (task DAG, current blockers, QA gates).
- **Right column**: live agent feed (messages, confidence, handoffs).
- **Bottom panel**: generated assets preview (website/app/workflows).

### UX principles

- Show what agents are doing, why, and with what confidence.
- Keep reversibility obvious (rollback, audit trail, diffs).
- Separate recommendations from executed changes.

---

## 7) Next Build Steps (Implementation-ready)

1. **Create orchestration contracts first**
   - Add `AgentType`, `TaskNode`, `RunState`, `RiskLevel` shared types.
   - Implement event envelope + idempotency keys.

2. **Refactor backend into modules**
   - `/core/orchestrator`
   - `/core/memory`
   - `/domains/{planning,build,growth,ops,monitor}`
   - `/integrations/{payments,crm,analytics,email}`

3. **Upgrade data model**
   - Add tables for goals/tasks/agent_runs/artifacts/monitor_alerts.
   - Introduce outbox table for reliable event publication.

4. **Build Agent Console UI**
   - Real-time task status, per-agent logs, gate outcomes.
   - Artifact diffing + approval actions.

5. **Implement QA/Deploy gates**
   - Mandatory lint/test/build checks per build task.
   - Environment promotion strategy: preview → staging → production.

6. **Ship vertical kit framework**
   - Template pack format with:
     - persona assumptions
     - workflow templates
     - starter features
     - growth playbooks

7. **Measure success with system KPIs**
   - Time-to-first-business (TTFBiz)
   - Time-to-first-revenue (TTFR)
   - Autonomy completion rate
   - Human interventions per run
   - Post-launch conversion uplift

---

## Proposed repository structure

```txt
app/
  (marketing)/
  (auth)/
  dashboard/
    command-center/
    agents/
    product-studio/
    growth/
    operations/
    analytics/

core/
  orchestrator/
  memory/
  policies/
  events/

domains/
  planning/
  build/
  ux/
  qa/
  growth/
  operations/
  monitor/

integrations/
  payments/
  crm/
  analytics/
  notifications/

workers/
  agent-runner/
  qa-runner/
  deploy-runner/

prisma/
  schema.prisma
  migrations/
```

This design positions LaunchOS as an **AI Founder OS**: not just generating code artifacts, but operating a full, continuously improving business system.

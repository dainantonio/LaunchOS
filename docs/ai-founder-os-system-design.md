# LaunchOS AI Founder OS — Production Blueprint (v2)

LaunchOS is redesigned as an **Agentic Founder Operating System** that transforms one user goal into a launch-ready, growth-ready business.

Unlike app generators, LaunchOS orchestrates business strategy, product delivery, revenue ops, and continuous optimization through coordinated specialist agents.

---

## 1) Refactored System Architecture

### 1.1 Architecture principles

1. **Goal-first, not app-first**: all execution starts from business outcomes (e.g., first revenue in 14 days).
2. **Multi-agent by default**: planning, delivery, QA, growth, and ops are separate cooperating agents.
3. **Event-driven execution**: every action emits immutable events for traceability and replay.
4. **Human-governed autonomy**: policy engine controls what can run autonomously.
5. **Continuous improvement loop**: monitor signals create new optimization work automatically.

### 1.2 Layered platform model

```text
[Mission Control UI]
    ↓
[API Gateway + Auth + Tenancy]
    ↓
[Agent Orchestrator + Workflow Engine + Policy Engine]
    ↓
[Domain Services: Planning | Build | QA | Growth | Ops | Monitor]
    ↓
[Data Plane: Postgres | Vector Memory | Object Storage | Event Store]
    ↓
[Runtime: Workers | CI/CD | Observability | Integrations]
```

### 1.3 Bounded contexts

- **Identity & Tenancy**: users, workspaces, roles, plans, limits.
- **Goal Intake**: idea capture, constraints, budget, timeline, risk appetite.
- **Strategy**: market validation, business model, offer design, GTM strategy.
- **Product Delivery**: architecture, code generation, infra, deployment.
- **Revenue & Growth**: pricing tests, campaigns, SEO, conversion funnels.
- **Operations**: CRM automations, service workflows, notifications, support.
- **Intelligence**: KPI tracking, anomaly detection, recommendation engine.

### 1.4 End-to-end lifecycle

`Goal Submitted → Founder Brief → Task DAG Generated → Parallel Agent Execution → QA Gates → Deploy → Growth Activation → Monitor Signals → Optimization Backlog`

---

## 2) Agent Orchestration Design

### 2.1 Agent roster (required)

1. **Founder Agent**
   - Converts raw idea into strategy brief, success criteria, and operating constraints.
2. **Product Architect Agent**
   - Defines technical blueprint, feature roadmap, domain boundaries, API contracts.
3. **Builder Agent**
   - Generates frontend/backend/db/auth/payments/integrations and deploy configs.
4. **UX Agent**
   - Designs user journeys, IA, UX copy, accessibility requirements, interaction states.
5. **QA Agent**
   - Generates and executes test suites; blocks unsafe releases.
6. **Growth Agent**
   - Produces launch assets, channel plan, campaign variants, and experiment schedule.
7. **Operations Agent**
   - Builds CRM workflows, onboarding automations, support playbooks, notifications.
8. **Monitor Agent**
   - Tracks KPI movement, identifies drop-offs, proposes improvements and expansions.

### 2.2 Shared memory architecture

- **Working Memory** (run-scoped): current goal, active tasks, blockers, temporary assumptions.
- **Business Memory** (workspace-scoped): ICPs, offers, pricing history, positioning narratives.
- **Artifact Memory**: generated code, copy assets, diagrams, deployment manifests, test reports.
- **Decision Ledger**: rationale, confidence score, alternatives considered, approving actor.

### 2.3 Execution protocol

Every job is represented as a `TaskNode` in a DAG with:

- `task_id`, `goal_id`, `owner_agent`, `risk_class`
- `inputs_schema`, `outputs_schema`
- `depends_on[]`
- `quality_gates[]`
- `rollback_plan`
- `status`: `queued | running | blocked | done | failed`

### 2.4 Event taxonomy

- `goal.created`
- `brief.generated`
- `plan.composed`
- `task.started`
- `task.completed`
- `task.failed`
- `qa.gate.failed`
- `qa.gate.passed`
- `deployment.promoted`
- `monitor.alert.created`
- `improvement.task.proposed`

### 2.5 Autonomy and safety controls

- **Modes**: Advisory, Semi-Autonomous, Fully Autonomous.
- **Risk classes**:
  - L1: low-risk (copy, UI text, non-critical experiments)
  - L2: medium-risk (pricing, workflow changes)
  - L3: high-risk (schema/data migrations, production infra changes)
- **Mandatory approvals**:
  - legal/compliance sensitive content
  - irreversible data operations
  - payment policy and billing changes

---

## 3) Recommended Tech Stack

### 3.1 Frontend (Mission Control)

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + component system (shadcn/ui-style primitives)
- SSE/WebSocket stream for live agent activity
- Recharts/Visx for funnels, MRR, conversion and cohort charts

### 3.2 Backend and orchestration

- Node API gateway (Next route handlers / Fastify)
- Python agent runtime services for planning-heavy tasks
- Workflow engine:
  - Start: BullMQ + Redis
  - Scale path: Temporal for durable long-running workflows
- Eventing:
  - Early stage: Postgres outbox + worker dispatcher
  - Scale stage: Kafka/NATS

### 3.3 Data and storage

- Postgres (primary transactional DB)
- pgvector for semantic memory (initial)
- S3-compatible object storage for artifacts/assets
- Optional Supabase stack for managed Postgres/auth/storage acceleration

### 3.4 DevOps and reliability

- Dockerized services + queue workers
- CI/CD with preview/staging/prod promotion gates
- Observability: OpenTelemetry + Grafana + Sentry
- Feature flags + product analytics: PostHog

### 3.5 AI model strategy

- Provider abstraction layer with failover routing
- Model classes:
  - strategy/reasoning
  - coding and refactoring
  - low-cost summarization/extraction
- Budget controls: token caps, per-task cost policy, ROI-aware generation

---

## 4) Product Roadmap

### Phase 0 (Week 0–1): Platform hardening

- Fix current build/lint blockers
- establish quality baseline and CI required checks
- define architecture decision records (ADRs)

### Phase 1 (Week 2–4): Agent runtime foundation

- Implement task DAG orchestration
- Add shared memory primitives and decision ledger
- Ship Agent Console (live activity + task states)

### Phase 2 (Week 5–7): Idea → business generation

- Generate strategy brief (market validation, revenue model, offer)
- Generate technical blueprint and MVP backlog
- Generate launch assets (landing, pricing, onboarding, CRM pipeline)

### Phase 3 (Week 8–10): Autonomous QA + Deploy

- QA agent release gates (unit/integration/e2e/security)
- one-click deployment + rollback
- deployment audit timeline in Mission Control

### Phase 4 (Week 11–12): Growth + Intelligence

- Growth agent experiments (SEO/content/ad copy/channel variants)
- Monitor agent anomaly detection and weekly optimization reports
- Expansion suggestions engine (new features/products/services)

### Vertical Kit rollout

- **NotaryOS**
- **Local Service Business Kit**
- **Faith Creator Kit**
- **Family Management Kit**
- **Education/Kids Learning Kit**

---

## 5) Database Schema Outline

### 5.1 Core tables

- `workspaces`
- `workspace_members`
- `goals`
- `founder_briefs`
- `business_models`
- `agent_runs`
- `task_nodes`
- `task_edges`
- `artifacts`
- `deployments`
- `campaigns`
- `experiments`
- `crm_contacts`
- `automations`
- `kpi_metrics`
- `monitor_alerts`
- `improvement_recommendations`
- `event_outbox`
- `decision_ledger`

### 5.2 Example column-level outline

- **goals**
  - `id`, `workspace_id`, `title`, `idea_text`, `target_market`, `constraints_json`, `status`, `created_at`
- **agent_runs**
  - `id`, `goal_id`, `agent_type`, `input_json`, `output_json`, `status`, `cost_usd`, `started_at`, `ended_at`
- **task_nodes**
  - `id`, `goal_id`, `owner_agent`, `task_type`, `risk_class`, `priority`, `state`, `acceptance_criteria_json`, `retry_count`
- **artifacts**
  - `id`, `goal_id`, `task_id`, `artifact_type`, `storage_uri`, `version`, `checksum`, `metadata_json`
- **kpi_metrics**
  - `id`, `workspace_id`, `metric_key`, `metric_value`, `dimension_json`, `period_start`, `period_end`, `source`
- **event_outbox**
  - `id`, `topic`, `payload_json`, `published_at`, `attempt_count`, `status`

### 5.3 Non-functional requirements

- Row-level tenancy isolation
- append-only event and decision log
- idempotent consumers on all asynchronous topics
- point-in-time restore + audit-ready traceability

---

## 6) UI Layout (Mission Control Dashboard)

### 6.1 Navigation model

1. **Command Center** (goal intake + run control)
2. **Agents** (status, handoffs, logs)
3. **Product Studio** (architecture, code artifacts, preview)
4. **Growth Engine** (campaigns, SEO, experiments)
5. **Operations Hub** (CRM, automations, notifications)
6. **Intelligence** (KPIs, alerts, recommendations)
7. **Governance** (autonomy policy, approvals, audit log)

### 6.2 Command Center layout

- **Top bar**: current workspace, goal selector, autonomy mode, run state, emergency stop.
- **Left pane**: idea input wizard (goal, target customer, budget, deadline, vertical kit).
- **Center pane**: execution graph (task DAG + QA gates + blockers).
- **Right pane**: live agent stream (who is doing what + confidence + pending approvals).
- **Bottom pane**: generated business assets preview (site/app/workflows/CRM/analytics).

### 6.3 UX requirements

- "Why this action" transparency on all agent outputs
- one-click diff + rollback for every material change
- confidence and risk badges per action
- explicit separation: **recommendation** vs **executed change**

---

## 7) Next Build Steps (Implementation-ready)

### Sprint A — Refactor foundation

1. Introduce shared contracts: `AgentType`, `TaskNode`, `RunState`, `RiskClass`, `EventEnvelope`.
2. Create module boundaries:
   - `core/orchestrator`
   - `core/policy`
   - `core/memory`
   - `domains/{founder,architect,builder,ux,qa,growth,ops,monitor}`
3. Add outbox pattern and event dispatcher worker.

### Sprint B — Runtime and UI

4. Build Agent Console with live updates (SSE first).
5. Implement approval queue and risk-based action gating.
6. Add artifact explorer (specs, code outputs, marketing assets, test reports).

### Sprint C — Autonomous delivery

7. Add QA pipeline gates:
   - lint, unit, integration, e2e, security checks
8. Add environment promotions:
   - preview → staging → production with rollback snapshots
9. Add deployment verification checks and incident hooks.

### Sprint D — Business generation and growth loops

10. Implement vertical template pack format:
    - persona assumptions
    - business model defaults
    - workflow templates
    - growth playbooks
11. Ship initial kits (NotaryOS + Faith Creator).
12. Add monitor-triggered weekly optimization jobs.

### Success metrics

- **Time to First Business Plan**
- **Time to First Deploy**
- **Time to First Revenue Event**
- **Autonomous Completion Rate**
- **Human Interventions per Goal Run**
- **Week-over-Week Conversion Uplift**

---

## Target repository structure

```text
app/
  (marketing)/
  (auth)/
  dashboard/
    command-center/
    agents/
    product-studio/
    growth/
    operations/
    intelligence/
    governance/

core/
  orchestrator/
  policy/
  memory/
  events/
  telemetry/

domains/
  founder/
  architect/
  builder/
  ux/
  qa/
  growth/
  operations/
  monitor/

integrations/
  payments/
  analytics/
  crm/
  notifications/
  seo/

workers/
  orchestration-runner/
  qa-runner/
  deploy-runner/
  monitor-runner/

prisma/
  schema.prisma
  migrations/

docs/
  ai-founder-os-system-design.md
  adrs/
```

This blueprint makes LaunchOS a **business-generation operating system** with autonomous planning, execution, deployment, and growth optimization—not just a software code generator.

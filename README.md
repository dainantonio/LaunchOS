# LaunchOS (MVP)

LaunchOS is a **local-first SaaS MVP** that helps founders and teams go from **customer signals → positioning → launch kit → A/B experiments + analytics** in one workflow.

It’s built to ship fast, test messages early, and keep a tight loop between research and marketing execution.

---

## AI Founder OS redesign

A production-grade redesign plan that evolves LaunchOS from MVP into a multi-agent AI Founder Operating System is available here:

- `docs/agentic-autonomous-refactor-plan.md` (recommended, autonomous multi-agent v4)
- `docs/ai-founder-os-production-plan.md` (implementation-focused v3)
- `docs/ai-founder-os-system-design.md` (earlier design reference)

It includes:
- refactored system architecture
- multi-agent orchestration design
- recommended tech stack
- product roadmap
- database schema outline
- mission-control UI layout
- implementation next steps

---

## What LaunchOS does

### ✅ Research → Gap Finder
Paste sources (reviews, forum posts, competitor notes, interview transcripts) and generate:
- pain point clusters
- a recommended “wedge” angle
- feature gaps + risks
- quick validation tests to run in the next 7 days

### ✅ Positioning
Generate and store:
- ICP (primary/secondary/excluded)
- problem statement + value proposition
- “why now” narrative
- 3 positioning angles (headlines + proof points)
- pricing hypothesis + first offer

### ✅ Launch Kit Assets (stored as Markdown)
Generate and edit:
- Landing page copy (sections)
- Product Hunt listing
- App Store listing
- 10 short-form video scripts
- 5-email onboarding sequence

Each section includes quick copy/export workflow.

### ✅ Experiments + Tracking
Create A/B variants (A + B) and get shareable public links:
- `/v/[variantId]` pages track events (VIEW, CTA, SIGNUP)
- Basic analytics show conversion rates per variant

### ✅ Plans & Entitlements (server-side)
Mock billing tiers with hard limits enforced server-side:
- project limits
- generation limits per month
- experiment limits per project

---

## Tech stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** (premium UI, mobile-first)
- **Prisma** + **SQLite** (local database)
- **Email + password auth** (bcrypt) + cookie sessions (JWT)
- **Mock AI generation** (works without external APIs)

---

## Quick start

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
```bash
cp .env.example .env
```

Then update `.env` and set:
- `SESSION_SECRET` to any long random string.

### 3) Generate Prisma client
```bash
npm run prisma:generate
```

### 4) Run database migrations
```bash
npm run prisma:migrate
```

### 5) (Optional) Seed sample data
```bash
npm run db:seed
```

### 6) Start development server
```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Preview in GitHub Codespaces

1. Start the app:
   ```bash
   npm run dev
   ```
2. Open the **Ports** panel in Codespaces.
3. Find forwarded port `3000` and click **Open in Browser**.
4. Alternatively, open the forwarded URL ending in `-3000.app.github.dev`.

---

## Common commands

```bash
npm run dev           # local dev
npm run build         # production build
npm run start         # run production server
npm run lint          # lint (requires ESLint setup)
npm run prisma:studio # browse local DB
```

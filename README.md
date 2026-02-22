# LaunchOS (MVP)

LaunchOS is a **local-first SaaS MVP** that helps founders and teams go from **customer signals → positioning → launch kit → A/B experiments + analytics** in one workflow.

It’s built to ship fast, test messages early, and keep a tight loop between research and marketing execution.

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

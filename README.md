# LaunchOS (MVP)

A working, local-first SaaS MVP (Next.js App Router + TypeScript + Tailwind + Prisma/SQLite) that helps users:
- Create Projects
- Paste sources (reviews/notes/forums)
- Generate Research Insights + Positioning + Launch Kit Assets (Mock AI mode)
- Run A/B Experiments with public variant pages and event tracking
- Enforce tiered plans server-side (mock billing switch)

## Quick start

### 1) Install
```bash
npm install
```

### 2) Configure env
Copy `.env.example` to `.env` and set a session secret:
```bash
cp .env.example .env


```

### 3) Setup DB
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4) Run
```bash
npm run dev
```

Open: http://localhost:3000

## Demo account
After seeding:
- Email: demo@launchos.dev
- Password: demo1234

## Notes
- AI generation runs in **Mock Mode** (deterministic, realistic outputs) so the app works with no external services.
- Plan switch is in **App → Settings** (mock billing). Entitlements are enforced server-side for:
  - project limits
  - generation limits per month
  - experiment limits


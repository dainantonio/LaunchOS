import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardBody, CardHeader, Button, Badge } from "@/components/ui";
import { logoutAction } from "@/lib/actions/auth";
import { getWorkspaceTier } from "@/lib/entitlements";
import { LIMITS } from "@/lib/plan";
import { setPlanAction, saveAIKeyAction } from "@/lib/actions/settings";

export default async function DashboardPage() {
  const session = await requireSession();
  const [projects, tier, ws, plan] = await Promise.all([
    prisma.project.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { createdAt: "desc" } }),
    getWorkspaceTier(session.workspaceId),
    prisma.workspace.findUnique({ where: { id: session.workspaceId } }),
    prisma.plan.findUnique({ where: { workspaceId: session.workspaceId } })
  ]);

  const limits = LIMITS[tier];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Dashboard</div>
          <div className="mt-1 text-sm text-zinc-300">
            Workspace: <span className="font-semibold text-white">{ws?.name}</span> · Plan <Badge>{tier}</Badge>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Limits: {limits.maxProjects} projects · {limits.maxGenerationsPerMonth}/mo generations · {limits.maxExperiments} experiments/project
          </div>
        </div>

        <form action={logoutAction}>
          <Button variant="ghost" type="submit">Log out</Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Projects" subtitle="Jump back in or create a new one." right={
            <Link href="/app/projects/new"><Button>New Project</Button></Link>
          } />
          <CardBody>
            {projects.length === 0 ? (
              <div className="text-sm text-zinc-300">
                No projects yet. <Link className="text-emerald-300" href="/app/projects/new">Create your first project</Link>.
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map(p => (
                  <Link key={p.id} href={`/app/projects/${p.id}?tab=research`} className="block rounded-xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-400 line-clamp-2">{p.nicheKeywords}</div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Settings (Mock Billing)" subtitle="Plan switch + optional AI key (stored locally in DB)." />
          <CardBody className="space-y-5">
            <form action={setPlanAction} className="space-y-2">
              <div className="text-sm font-semibold">Plan</div>
              <div className="grid grid-cols-2 gap-2">
                {(["FREE","SOLO","TEAM","AGENCY"] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10">
                    <input type="radio" name="tier" value={t} defaultChecked={tier === t} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              <Button type="submit">Update plan</Button>
              <div className="text-xs text-zinc-400">Entitlements are enforced server-side.</div>
            </form>

            <form action={saveAIKeyAction} className="space-y-2">
              <div className="text-sm font-semibold">AI Key (optional)</div>
              <input
                name="aiKey"
                defaultValue={ws?.aiKey ?? ""}
                placeholder="Paste a provider key (not used in MVP; Mock Mode always works)"
                className="w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
              <Button variant="ghost" type="submit">Save key</Button>
              <div className="text-xs text-zinc-400">MVP runs without external services.</div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

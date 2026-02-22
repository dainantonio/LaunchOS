import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardBody, CardHeader, Badge, Input } from "@/components/ui";
import { getWorkspaceTier } from "@/lib/entitlements";
import { LIMITS } from "@/lib/plan";
import { setPlanAction, saveAISettingsAction } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/submit-button";
import { TeamPanel } from "@/components/team-panel";

export default async function DashboardPage() {
  const session = await requireSession();

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const [projects, tier, ws] = await Promise.all([
    prisma.project.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { createdAt: "desc" } }),
    getWorkspaceTier(session.workspaceId),
    prisma.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
        invites: { orderBy: { createdAt: "desc" } },
        memberships: { include: { user: true }, orderBy: { createdAt: "asc" } }
      }
    })
  ]);

  const limits = LIMITS[tier];
  const canHaveTeam = limits.maxMembers > 1;
  const isOwner = session.role === "OWNER";

  const members = (ws?.memberships ?? []).map(m => ({
    id: m.id,
    userId: m.userId,
    email: m.user.email,
    role: (m.role === "OWNER" ? "OWNER" : "MEMBER") as "OWNER" | "MEMBER"
  }));

  const invites = (ws?.invites ?? []).map(i => ({
    id: i.id,
    email: i.email,
    token: i.token,
    expiresAt: i.expiresAt.toISOString(),
    acceptedAt: i.acceptedAt ? i.acceptedAt.toISOString() : null
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Dashboard</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
            <span>Workspace:</span>
            <span className="font-semibold text-white">{ws?.name}</span>
            <span>·</span>
            <span>Role</span> <Badge>{session.role}</Badge>
            <span>·</span>
            <span>Plan</span> <Badge>{tier}</Badge>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Limits: {limits.maxProjects} projects · {limits.maxGenerationsPerMonth}/mo generations · {limits.maxExperiments} experiments/project · {limits.maxMembers} members
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/projects/new">
            <SubmitButton pendingText="Opening…">New Project</SubmitButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Projects" subtitle="Jump back in or create a new one." />
          <CardBody>
            {projects.length === 0 ? (
              <div className="text-sm text-zinc-300">
                No projects yet.{" "}
                <Link className="text-emerald-300" href="/app/projects/new">
                  Create your first project
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/app/projects/${p.id}?tab=research`}
                    className="block rounded-xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10"
                  >
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-400 line-clamp-2">{p.nicheKeywords}</div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Settings (Mock Billing + BYOK)" subtitle="Plan switch + AI Provider (Mock/OpenAI/Anthropic)." />
          <CardBody className="space-y-6">
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
              <SubmitButton pendingText="Updating…">Update plan</SubmitButton>
              <div className="text-xs text-zinc-400">Entitlements are enforced server-side.</div>
            </form>

            <form action={saveAISettingsAction} className="space-y-2">
              <div className="text-sm font-semibold">AI Provider (BYOK)</div>

              <div className="grid grid-cols-3 gap-2">
                {(["MOCK","OPENAI","ANTHROPIC"] as const).map(p => (
                  <label key={p} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10">
                    <input type="radio" name="aiProvider" value={p} defaultChecked={(ws?.aiProvider ?? "MOCK") === p} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-xs text-zinc-400">Model (optional)</label>
                <Input name="aiModel" defaultValue={ws?.aiModel ?? ""} placeholder="OpenAI: gpt-4o-mini | Anthropic: claude-sonnet-4-6" />
              </div>

              <div>
                <label className="text-xs text-zinc-400">API Key (optional)</label>
                <Input type="password" name="aiKey" defaultValue={ws?.aiKey ?? ""} placeholder="Paste key (stored in local DB)" />
              </div>

              <SubmitButton variant="ghost" pendingText="Saving…">Save AI settings</SubmitButton>
              <div className="text-xs text-zinc-400">If key is missing or errors occur, LaunchOS falls back to Mock Mode.</div>
            </form>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Team"
          subtitle={
            !canHaveTeam
              ? "Upgrade plan to TEAM/AGENCY to invite members."
              : isOwner
              ? "Optimistic UI: invites & role changes feel instant."
              : "Only owners can invite or manage roles."
          }
        />
        <CardBody>
          <TeamPanel
            baseUrl={baseUrl}
            isOwner={isOwner}
            canHaveTeam={canHaveTeam}
            maxMembers={limits.maxMembers}
            currentUserId={session.userId}
            members={members}
            invites={invites}
          />
        </CardBody>
      </Card>
    </div>
  );
}

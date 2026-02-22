import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardBody, CardHeader, Button, Badge, Input } from "@/components/ui";
import { logoutAction } from "@/lib/actions/auth";
import { getWorkspaceTier } from "@/lib/entitlements";
import { LIMITS } from "@/lib/plan";
import { setPlanAction, saveAISettingsAction } from "@/lib/actions/settings";
import { createInviteAction, revokeInviteAction, resendInviteAction } from "@/lib/actions/invites";
import { promoteMemberAction, removeMemberAction, leaveWorkspaceAction, switchWorkspaceAction } from "@/lib/actions/workspace";
import { CopyButton } from "@/components/copy-button";

export default async function DashboardPage({ searchParams }: { searchParams?: { error?: string } }) {
  const session = await requireSession();
  const bannerError = searchParams?.error ? decodeURIComponent(searchParams.error) : "";

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const [projects, tier, ws, allMemberships] = await Promise.all([
    prisma.project.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { createdAt: "desc" } }),
    getWorkspaceTier(session.workspaceId),
    prisma.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
        invites: { orderBy: { createdAt: "desc" } },
        memberships: { include: { user: true }, orderBy: { createdAt: "asc" } }
      }
    }),
    prisma.membership.findMany({
      where: { userId: session.userId },
      include: { workspace: true },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const limits = LIMITS[tier];
  const canHaveTeam = limits.maxMembers > 1;
  const isOwner = session.role === "OWNER";

  const members = ws?.memberships ?? [];
  const pendingInvites = (ws?.invites ?? []).filter((inv) => !inv.acceptedAt);

  const ownerCount = members.filter((m) => m.role === "OWNER").length;

  return (
    <div className="space-y-6">
      {bannerError ? (
        <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200 ring-1 ring-rose-400/20">
          {bannerError}
        </div>
      ) : null}

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

          {allMemberships.length > 1 ? (
            <form action={switchWorkspaceAction} className="mt-3 flex items-center gap-2">
              <select
                name="workspaceId"
                defaultValue={session.workspaceId}
                className="rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10"
              >
                {allMemberships.map((m) => (
                  <option key={m.workspaceId} value={m.workspaceId}>
                    {m.workspace.name}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="ghost">
                Switch
              </Button>
            </form>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <form action={leaveWorkspaceAction}>
            <Button variant="ghost" type="submit">
              Leave workspace
            </Button>
          </form>
          <form action={logoutAction}>
            <Button variant="ghost" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader
            title="Projects"
            subtitle="Jump back in or create a new one."
            right={
              <Link href="/app/projects/new">
                <Button>New Project</Button>
              </Link>
            }
          />
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
                {(["FREE", "SOLO", "TEAM", "AGENCY"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10">
                    <input type="radio" name="tier" value={t} defaultChecked={tier === t} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              <Button type="submit">Update plan</Button>
              <div className="text-xs text-zinc-400">Entitlements are enforced server-side.</div>
            </form>

            <form action={saveAISettingsAction} className="space-y-2">
              <div className="text-sm font-semibold">AI Provider (BYOK)</div>

              <div className="grid grid-cols-3 gap-2">
                {(["MOCK", "OPENAI", "ANTHROPIC"] as const).map((p) => (
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

              <Button type="submit" variant="ghost">
                Save AI settings
              </Button>
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
              ? "Owner-only invites. Promote members to OWNER when needed."
              : "Only owners can invite or manage roles."
          }
        />
        <CardBody className="space-y-4">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Members</div>
            <div className="mt-2 space-y-2">
              {members.map((m) => {
                const isSelf = m.userId === session.userId;
                const canPromote = isOwner && m.role === "MEMBER";
                const canRemove = isOwner && !isSelf; // server prevents last-owner removal

                return (
                  <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950/40 p-3 ring-1 ring-white/10">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{m.user.email}</div>
                      <div className="text-xs text-zinc-400">
                        {m.role}{isSelf ? " · You" : ""}
                        {m.role === "OWNER" && ownerCount === 1 ? " · (Last owner)" : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge>Active</Badge>

                      {canPromote ? (
                        <form action={promoteMemberAction.bind(null, m.id)}>
                          <Button type="submit">Promote</Button>
                        </form>
                      ) : null}

                      {canRemove ? (
                        <form action={removeMemberAction.bind(null, m.id)}>
                          <Button type="submit" variant="danger">
                            Remove
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Promotions take effect immediately. Removing the last OWNER is blocked server-side.
            </div>
          </div>

          {canHaveTeam && isOwner ? (
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-sm font-semibold">Invite a member</div>
              <form action={createInviteAction} className="mt-3 flex flex-col gap-2 md:flex-row">
                <Input name="email" type="email" placeholder="teammate@email.com" required />
                <Button type="submit">Create invite</Button>
              </form>
              <div className="mt-2 text-xs text-zinc-400">MVP uses copyable invite links (no email sending yet).</div>

              <div className="mt-4 space-y-2">
                {pendingInvites.map((inv) => {
                  const isExpired = inv.expiresAt <= new Date();
                  const link = `${baseUrl}/auth/signup?invite=${inv.token}`;

                  return (
                    <div key={inv.id} className="rounded-xl bg-zinc-950/40 p-3 ring-1 ring-white/10">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{inv.email}</div>
                          <div className="text-xs text-zinc-400">
                            {isExpired ? "Expired" : `Expires: ${inv.expiresAt.toISOString().slice(0, 10)}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <form action={resendInviteAction.bind(null, inv.id)}>
                            <Button type="submit" variant="ghost">
                              Resend
                            </Button>
                          </form>
                          <form action={revokeInviteAction.bind(null, inv.id)}>
                            <Button type="submit" variant="danger">
                              Revoke
                            </Button>
                          </form>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
                        <div className="truncate text-xs text-zinc-300">{link}</div>
                        <CopyButton text={link} label="Copy link" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}

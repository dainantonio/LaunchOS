import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardBody, CardHeader, Button, Badge } from "@/components/ui";
import { generateInsightsAction, generatePositioningAction, createExperimentWithVariantsAction } from "@/lib/actions/generate";
import { AssetsPanel } from "@/components/assets-panel";
import type { AssetType } from "@/lib/constants";

export default async function ProjectPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { tab?: string; asset?: string };
}) {
  const session = await requireSession();
  const projectId = params.id;
  const tab = searchParams.tab || "research";

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: session.workspaceId },
    include: {
      sources: { orderBy: { createdAt: "desc" } },
      clusters: true,
      positioning: true,
      assets: { include: { items: true }, orderBy: { createdAt: "desc" } },
      experiments: { include: { variants: true }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!project) {
    return (
      <div className="space-y-3">
        <div className="text-2xl font-semibold">Project not found</div>
        <Link href="/app" className="text-emerald-300">Go back</Link>
      </div>
    );
  }

  async function addSource(formData: FormData) {
    "use server";
    const s = await requireSession();

    const type = String(formData.get("type") || "NOTES");
    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();

    if (!title || !content) throw new Error("Title and content required.");

    await prisma.source.create({
      data: {
        projectId,
        type,
        title,
        content
      }
    });

    redirect(`/app/projects/${projectId}?tab=research`);
  }

  const navTabs = [
    { key: "research", label: "Research" },
    { key: "positioning", label: "Positioning" },
    { key: "assets", label: "Assets" },
    { key: "experiments", label: "Experiments" },
    { key: "analytics", label: "Analytics" }
  ];

  const initialAssets = project.assets.map((a) => ({
    id: a.id,
    type: a.type as AssetType,
    title: a.title,
    createdAt: a.createdAt.toISOString(),
    items: a.items.map((it) => ({
      id: it.id,
      sectionKey: it.sectionKey,
      contentMarkdown: it.contentMarkdown
    }))
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">{project.name}</div>
          <div className="mt-1 text-sm text-zinc-300 line-clamp-2">{project.nicheKeywords}</div>
        </div>
        <Link href="/app" className="text-sm text-zinc-300 hover:text-white">← Dashboard</Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {navTabs.map((t) => (
          <Link
            key={t.key}
            href={`/app/projects/${projectId}?tab=${t.key}`}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-white/10 ${
              tab === t.key ? "bg-white/10 text-white" : "bg-white/0 text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "research" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader
              title="Sources"
              subtitle="Paste reviews, forum threads, competitor notes, or transcripts."
              right={
                <form action={generateInsightsAction.bind(null, projectId)}>
                  <Button type="submit">Generate Insights</Button>
                </form>
              }
            />
            <CardBody className="space-y-4">
              <form action={addSource} className="space-y-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-zinc-400">Type</label>
                    <select name="type" className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10">
                      <option value="NOTES">Notes</option>
                      <option value="REVIEW">Review</option>
                      <option value="FORUM">Forum</option>
                      <option value="COMPETITOR">Competitor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400">Title</label>
                    <input
                      name="title"
                      className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10"
                      placeholder="Reddit thread: pricing complaints"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Content</label>
                  <textarea
                    name="content"
                    className="mt-1 min-h-[140px] w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10"
                    placeholder="Paste text here..."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="ghost">Add source</Button>
                </div>
              </form>

              <div className="space-y-2">
                {project.sources.length === 0 ? (
                  <div className="text-sm text-zinc-300">No sources yet. Add 2–5 and then Generate Insights.</div>
                ) : (
                  project.sources.map((s) => (
                    <div key={s.id} className="rounded-xl bg-zinc-950/40 p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{s.title}</div>
                        <Badge>{s.type}</Badge>
                      </div>
                      <div className="mt-2 text-xs text-zinc-400 line-clamp-3">{s.content}</div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Insights" subtitle="Clusters appear here after generation." />
            <CardBody className="space-y-3">
              {project.clusters.length === 0 ? (
                <div className="text-sm text-zinc-300">Generate insights to see clustered pains and gaps.</div>
              ) : (
                project.clusters.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-sm font-semibold">{c.label}</div>
                    <div className="mt-1 text-sm text-zinc-300">{c.summary}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">
                      <Badge>Severity {c.severity}/5</Badge>
                      <Badge>Frequency {c.frequency}/5</Badge>
                      <Badge>{c.who}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "positioning" ? (
        <Card>
          <CardHeader
            title="Positioning"
            subtitle="Generate ICP, angles, and pricing hypotheses."
            right={
              <form action={generatePositioningAction.bind(null, projectId)}>
                <Button type="submit">Generate</Button>
              </form>
            }
          />
          <CardBody className="space-y-4">
            {!project.positioning ? (
              <div className="text-sm text-zinc-300">No positioning yet. Click Generate.</div>
            ) : (
              <>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-xs text-zinc-400">Problem</div>
                  <div className="mt-2 text-sm text-zinc-200">{project.positioning.problemStatement}</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-xs text-zinc-400">Value proposition</div>
                  <div className="mt-2 text-sm text-zinc-200">{project.positioning.valueProp}</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-xs text-zinc-400">Recommended angle</div>
                  <div className="mt-2 text-sm text-zinc-200">{project.positioning.recommendedAngle}</div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === "assets" ? (
        <AssetsPanel
          projectId={projectId}
          initialAssets={initialAssets}
          initialSelectedAssetId={searchParams.asset || ""}
        />
      ) : null}

      {tab === "experiments" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Create A/B experiment" subtitle="Two angles, two public links, tracked events." />
            <CardBody>
              <form action={createExperimentWithVariantsAction.bind(null, projectId)} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400">Experiment name</label>
                  <input name="name" className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10" placeholder="Headline test" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Angle A (headline)</label>
                  <input name="angleA" className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10" placeholder="Stop undercharging travel." />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Angle B (headline)</label>
                  <input name="angleB" className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10" placeholder="Your calendar should make money." />
                </div>
                <Button type="submit">Create experiment</Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Experiments" subtitle="Share variant links and watch conversions." />
            <CardBody className="space-y-3">
              {project.experiments.length === 0 ? (
                <div className="text-sm text-zinc-300">No experiments yet.</div>
              ) : (
                project.experiments.map((exp) => (
                  <div key={exp.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-sm font-semibold">{exp.name}</div>
                    <div className="mt-2 space-y-2">
                      {exp.variants.map((v) => (
                        <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-950/40 p-3 ring-1 ring-white/10">
                          <div>
                            <div className="text-xs text-zinc-400">Variant {v.key}</div>
                            <div className="text-sm font-semibold">{v.headline}</div>
                          </div>
                          <Link className="text-sm text-emerald-300" href={`/v/${v.id}`}>
                            Open /v/{v.id.slice(0, 6)}…
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "analytics" ? (
        <Card>
          <CardHeader title="Analytics" subtitle="Basic variant event counts (views/cta/signup)." />
          <CardBody>
            <div className="text-sm text-zinc-300">Open an experiment variant link (/v/...) to start generating events.</div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

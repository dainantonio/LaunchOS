import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardBody, CardHeader, Button, Badge } from "@/components/ui";
import { createExperimentWithVariantsAction } from "@/lib/actions/generate";
import { AssetsPanel } from "@/components/assets-panel";
import { ResearchPanel } from "@/components/research-panel";
import { PositioningPanel } from "@/components/positioning-panel";
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

  const initialSources = project.sources.map((s) => ({
    id: s.id,
    type: s.type,
    title: s.title,
    content: s.content,
    createdAt: s.createdAt.toISOString()
  }));

  const initialClusters = project.clusters.map((c) => ({
    id: c.id,
    label: c.label,
    summary: c.summary,
    who: c.who,
    severity: c.severity,
    frequency: c.frequency
  }));

  const initialPositioning = project.positioning
    ? {
        problemStatement: project.positioning.problemStatement,
        valueProp: project.positioning.valueProp,
        recommendedAngle: project.positioning.recommendedAngle,
        pricingJson: project.positioning.pricingJson,
        optionsJson: project.positioning.optionsJson
      }
    : null;

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
        <ResearchPanel projectId={projectId} initialSources={initialSources} initialClusters={initialClusters} />
      ) : null}

      {tab === "positioning" ? (
        <PositioningPanel projectId={projectId} initialPositioning={initialPositioning} />
      ) : null}

      {tab === "assets" ? (
        <AssetsPanel projectId={projectId} initialAssets={initialAssets} initialSelectedAssetId={searchParams.asset || ""} />
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

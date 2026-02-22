import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Badge, Divider } from "@/components/ui";
import { addSourceAction } from "@/lib/actions/projects";
import { generateInsightsAction, generatePositioningAction, generateAssetAction, createExperimentWithVariantsAction } from "@/lib/actions/generate";
import { AssetType } from "@prisma/client";
import { Markdown } from "@/components/markdown";

export default async function ProjectPage({ params, searchParams }: { params: { id: string }; searchParams: { tab?: string; asset?: string } }) {
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
        <div className="text-2xl font-semibold">Not found</div>
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
        {navTabs.map(t => (
          <Link
            key={t.key}
            href={`/app/projects/${projectId}?tab=${t.key}`}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-white/10 ${tab === t.key ? "bg-white/10" : "bg-white/0 hover:bg-white/5 text-zinc-300 hover:text-white"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "research" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Sources" subtitle="Paste reviews, forum threads, competitor notes, or transcripts." right={
              <form action={async () => { "use server"; await generateInsightsAction(projectId); }}>
                <Button type="submit">Generate Insights</Button>
              </form>
            } />
            <CardBody className="space-y-4">
              <form action={addSourceAction.bind(null, projectId)} className="space-y-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-zinc-400">Type</label>
                    <select name="type" className="w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10">
                      <option value="NOTES">Notes</option>
                      <option value="REVIEW">Review</option>
                      <option value="FORUM">Forum</option>
                      <option value="COMPETITOR">Competitor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400">Title</label>
                    <Input name="title" placeholder="Reddit thread: travel fees" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Content</label>
                  <Textarea name="content" placeholder="Paste text here..." required />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="ghost">Add source</Button>
                </div>
              </form>

              <div className="space-y-2">
                {project.sources.length === 0 ? (
                  <div className="text-sm text-zinc-300">No sources yet. Add 2–5 and then Generate Insights.</div>
                ) : (
                  project.sources.map(s => (
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
            <CardHeader title="Insights" subtitle="Clusters + wedge appear here after generation." />
            <CardBody className="space-y-3">
              {project.clusters.length === 0 ? (
                <div className="text-sm text-zinc-300">Generate insights to see clustered pains and gaps.</div>
              ) : (
                project.clusters.map(c => (
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
          <CardHeader title="Positioning" subtitle="Generate ICP, angles, and pricing hypotheses." right={
            <form action={async () => { "use server"; await generatePositioningAction(projectId); }}>
              <Button type="submit">Generate</Button>
            </form>
          } />
          <CardBody className="space-y-4">
            {!project.positioning ? (
              <div className="text-sm text-zinc-300">No positioning yet. Click Generate.</div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <Block title="Problem" content={project.positioning.problemStatement} />
                  <Block title="Value proposition" content={project.positioning.valueProp} />
                </div>
                <Divider />
                <div className="grid gap-3 md:grid-cols-2">
                  <Block title="Recommended angle" content={project.positioning.recommendedAngle} />
                  <Block title="Pricing hypothesis" content={project.positioning.pricingJson} mono />
                </div>
                <Divider />
                <Block title="Options (JSON)" content={project.positioning.optionsJson} mono />
              </>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === "assets" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Generate assets" subtitle="Landing, Product Hunt, App Store, Social scripts, Email sequence." />
            <CardBody className="space-y-3">
              <AssetButton projectId={projectId} type="LANDING" label="Generate Landing" />
              <AssetButton projectId={projectId} type="PRODUCTHUNT" label="Generate Product Hunt" />
              <AssetButton projectId={projectId} type="APPSTORE" label="Generate App Store" />
              <AssetButton projectId={projectId} type="SOCIAL" label="Generate Social Scripts" />
              <AssetButton projectId={projectId} type="EMAIL" label="Generate Email Sequence" />
              <div className="text-xs text-zinc-400">Assets are stored as Markdown sections with copy buttons.</div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Latest asset" subtitle="Edit/copy sections for your launch." />
            <CardBody className="space-y-3">
              {project.assets.length === 0 ? (
                <div className="text-sm text-zinc-300">Generate an asset to see it here.</div>
              ) : (
                <AssetViewer assetId={searchParams.asset || project.assets[0].id} assets={project.assets} />
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "experiments" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Create A/B experiment" subtitle="Two angles, two public links, tracked events." />
            <CardBody>
              <form action={createExperimentWithVariantsAction.bind(null, projectId)} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400">Experiment name</label>
                  <Input name="name" placeholder="Headline test" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Angle A (headline)</label>
                  <Input name="angleA" placeholder="Stop undercharging travel." />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Angle B (headline)</label>
                  <Input name="angleB" placeholder="Your calendar should make money." />
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
                project.experiments.map(exp => (
                  <div key={exp.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-sm font-semibold">{exp.name}</div>
                    <div className="mt-2 space-y-2">
                      {exp.variants.map(v => (
                        <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-950/40 p-3 ring-1 ring-white/10">
                          <div>
                            <div className="text-xs text-zinc-400">Variant {v.key}</div>
                            <div className="text-sm font-semibold">{v.headline}</div>
                          </div>
                          <Link className="text-sm text-emerald-300" href={`/v/${v.id}`}>Open /v/{v.id.slice(0, 6)}…</Link>
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
        <AnalyticsPanel projectId={projectId} workspaceId={session.workspaceId} />
      ) : null}
    </div>
  );
}

function Block({ title, content, mono }: { title: string; content: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-xs text-zinc-400">{title}</div>
      <div className={`mt-2 text-sm ${mono ? "font-mono text-xs text-zinc-200 whitespace-pre-wrap" : "text-zinc-200"}`}>
        {content}
      </div>
    </div>
  );
}

function AssetButton({ projectId, type, label }: { projectId: string; type: AssetType; label: string }) {
  return (
    <form action={async () => { "use server"; await generateAssetAction(projectId, type); }}>
      <Button type="submit" className="w-full">{label}</Button>
    </form>
  );
}

function AssetViewer({ assetId, assets }: { assetId: string; assets: any[] }) {
  const asset = assets.find(a => a.id === assetId) || assets[0];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">{asset.title}</div>
        <div className="flex flex-wrap gap-2">
          {assets.slice(0, 4).map(a => (
            <Link key={a.id} href={`?tab=assets&asset=${a.id}`} className={`rounded-xl px-3 py-1.5 text-xs ring-1 ring-white/10 ${a.id === asset.id ? "bg-white/10" : "bg-white/0 hover:bg-white/5 text-zinc-300 hover:text-white"}`}>
              {a.type}
            </Link>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {asset.items.map((it: any) => (
          <div key={it.id} className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-zinc-400">{it.sectionKey}</div>
              <CopyButton text={it.contentMarkdown} />
            </div>
            <div className="mt-3">
              <Markdown content={it.contentMarkdown} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="rounded-lg bg-white/5 px-2 py-1 text-xs text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
      }}
      type="button"
    >
      Copy
    </button>
  );
}

async function AnalyticsPanel({ projectId, workspaceId }: { projectId: string; workspaceId: string }) {
  const experiments = await prisma.experiment.findMany({
    where: { projectId },
    include: { variants: true },
    orderBy: { createdAt: "desc" }
  });

  const variantIds = experiments.flatMap(e => e.variants.map(v => v.id));
  const events = await prisma.event.findMany({
    where: { workspaceId, variantId: { in: variantIds } }
  });

  const leads = await prisma.lead.findMany({ where: { projectId } });

  const stats = experiments.flatMap(exp => exp.variants.map(v => {
    const views = events.filter(e => e.variantId === v.id && e.type === "VIEW").length;
    const ctas = events.filter(e => e.variantId === v.id && e.type === "CTA").length;
    const signups = leads.filter(l => l.variantId === v.id).length;
    const ctaRate = views ? (ctas / views) : 0;
    const signupRate = views ? (signups / views) : 0;
    return { exp: exp.name, key: v.key, variantId: v.id, views, ctas, signups, ctaRate, signupRate };
  }));

  return (
    <Card>
      <CardHeader title="Analytics" subtitle="Basic conversion stats for A/B variants." />
      <CardBody>
        {stats.length === 0 ? (
          <div className="text-sm text-zinc-300">Create an experiment to see analytics.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs text-zinc-300">
                <tr>
                  <th className="px-4 py-3">Experiment</th>
                  <th className="px-4 py-3">Variant</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">CTA</th>
                  <th className="px-4 py-3">Signups</th>
                  <th className="px-4 py-3">CTA rate</th>
                  <th className="px-4 py-3">Signup rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.variantId} className="border-t border-white/10">
                    <td className="px-4 py-3 text-zinc-200">{s.exp}</td>
                    <td className="px-4 py-3"><Badge>{s.key}</Badge></td>
                    <td className="px-4 py-3">{s.views}</td>
                    <td className="px-4 py-3">{s.ctas}</td>
                    <td className="px-4 py-3">{s.signups}</td>
                    <td className="px-4 py-3">{(s.ctaRate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3">{(s.signupRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

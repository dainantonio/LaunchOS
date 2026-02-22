"use client";

import { useMemo, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Badge, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/toast";
import { SkeletonLine } from "@/components/skeleton";
import {
  addSourceDataAction,
  generateInsightsDataAction,
  type SourceView,
  type ClusterView
} from "@/lib/actions/research-data";

export function ResearchPanel({
  projectId,
  initialSources,
  initialClusters
}: {
  projectId: string;
  initialSources: SourceView[];
  initialClusters: ClusterView[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  const [sources, optimisticSources] = useOptimistic(initialSources, (state: SourceView[], next: SourceView[]) => next);
  const [clusters, optimisticClusters] = useOptimistic(initialClusters, (state: ClusterView[], next: ClusterView[]) => next);

  const hasSources = useMemo(() => sources.length > 0, [sources]);

  async function onAddSource(formData: FormData) {
    const type = String(formData.get("type") || "NOTES");
    const title = String(formData.get("title") || "");
    const content = String(formData.get("content") || "");

    const tempId = `temp_${Date.now()}`;
    const temp: SourceView = {
      id: tempId,
      type,
      title: title || "Saving…",
      content: content || "",
      createdAt: new Date().toISOString()
    };

    optimisticSources([temp, ...sources]);

    startTransition(async () => {
      const res = await addSourceDataAction(projectId, { type, title, content });
      if (!res.ok || !res.source) {
        optimisticSources(initialSources); // revert to server snapshot; then refresh to be safe
        push({ title: "Notice", message: res.error || "Could not add source." });
        router.refresh();
        return;
      }

      optimisticSources([res.source, ...sources.filter(s => s.id !== tempId)]);
      push({ title: "Notice", message: "Source added." });
      router.refresh();
    });
  }

  function onGenerateInsights() {
    // optimistic placeholder clusters
    const placeholder: ClusterView[] = Array.from({ length: 3 }).map((_, i) => ({
      id: `gen_${Date.now()}_${i}`,
      label: "Generating…",
      summary: "Analyzing sources and clustering pains…",
      who: "—",
      severity: 0,
      frequency: 0
    }));
    optimisticClusters(placeholder);

    startTransition(async () => {
      const res = await generateInsightsDataAction(projectId);
      if (!res.ok || !res.clusters) {
        push({ title: "Notice", message: res.error || "Could not generate insights." });
        router.refresh();
        return;
      }
      optimisticClusters(res.clusters);
      push({ title: "Notice", message: "Insights generated." });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader
          title="Sources"
          subtitle="Paste reviews, forum threads, competitor notes, or transcripts."
          right={
            <Button disabled={!hasSources || pending} onClick={onGenerateInsights}>
              {pending ? "Working…" : "Generate Insights"}
            </Button>
          }
        />
        <CardBody className="space-y-4">
          <form action={onAddSource} className="space-y-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
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
                <Input name="title" placeholder="Reddit thread: pricing complaints" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400">Content</label>
              <Textarea name="content" placeholder="Paste text here..." required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="ghost" disabled={pending}>
                {pending ? "Saving…" : "Add source"}
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {sources.length === 0 ? (
              <div className="text-sm text-zinc-300">No sources yet. Add 2–5, then Generate Insights.</div>
            ) : (
              sources.map((s) => (
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
          {clusters.length === 0 ? (
            <div className="text-sm text-zinc-300">Generate insights to see clustered pains and gaps.</div>
          ) : (
            clusters.map((c) => (
              <div key={c.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                {c.label === "Generating…" ? (
                  <div className="space-y-2">
                    <SkeletonLine className="h-4 w-40" />
                    <SkeletonLine className="h-3 w-full" />
                    <SkeletonLine className="h-3 w-10/12" />
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-semibold">{c.label}</div>
                    <div className="mt-1 text-sm text-zinc-300">{c.summary}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">
                      <Badge>Severity {c.severity}/5</Badge>
                      <Badge>Frequency {c.frequency}/5</Badge>
                      <Badge>{c.who}</Badge>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

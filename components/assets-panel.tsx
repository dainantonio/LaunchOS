"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, Card, CardBody, CardHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast";
import { SkeletonLine } from "@/components/skeleton";
import { generateAssetDataAction, type AssetView } from "@/lib/actions/assets-data";
import type { AssetType } from "@/lib/constants";

type AssetViewLocal = AssetView & { status?: "ready" | "generating" };

const TYPES: { type: AssetType; label: string }[] = [
  { type: "LANDING", label: "Landing" },
  { type: "PRODUCTHUNT", label: "Product Hunt" },
  { type: "APPSTORE", label: "App Store" },
  { type: "SOCIAL", label: "Social" },
  { type: "EMAIL", label: "Email" }
];

export function AssetsPanel({
  projectId,
  initialAssets,
  initialSelectedAssetId
}: {
  projectId: string;
  initialAssets: AssetView[];
  initialSelectedAssetId?: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  const [assets, setAssets] = useState<AssetViewLocal[]>(
    initialAssets.map((a) => ({ ...a, status: "ready" }))
  );

  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialSelectedAssetId && initialAssets.find((a) => a.id === initialSelectedAssetId)) return initialSelectedAssetId;
    return initialAssets[0]?.id || "";
  });

  // Keep selection valid if assets change
  useEffect(() => {
    if (selectedId && assets.some((a) => a.id === selectedId)) return;
    setSelectedId(assets[0]?.id || "");
  }, [assets, selectedId]);

  const selected = useMemo(() => assets.find((a) => a.id === selectedId) || null, [assets, selectedId]);

  function selectAsset(id: string) {
    setSelectedId(id);
    // Optional: keep URL in sync
    router.replace(`/app/projects/${projectId}?tab=assets&asset=${id}`);
  }

  function runGenerate(type: AssetType) {
    const snapshot = assets;

    const tempId = `temp_${Date.now()}`;
    const temp: AssetViewLocal = {
      id: tempId,
      type,
      title: `Generating ${type}…`,
      createdAt: new Date().toISOString(),
      items: [],
      status: "generating"
    };

    // Optimistic: replace existing of same type with temp
    setAssets((prev) => [temp, ...prev.filter((a) => a.type !== type)]);
    selectAsset(tempId);

    startTransition(async () => {
      const res = await generateAssetDataAction(projectId, type);
      if (!res.ok || !res.asset) {
        setAssets(snapshot);
        push({ title: "Notice", message: res.error || "Could not generate asset." });
        router.refresh();
        return;
      }

      setAssets((prev) => [{ ...res.asset, status: "ready" }, ...prev.filter((a) => a.type !== type && a.id !== tempId)]);
      selectAsset(res.asset.id);

      push({ title: "Notice", message: "Asset generated." });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader title="Generate assets" subtitle="Instant placeholders + auto-replace when ready." />
        <CardBody className="space-y-2">
          {TYPES.map((t) => (
            <Button
              key={t.type}
              className="w-full"
              disabled={pending}
              onClick={() => runGenerate(t.type)}
            >
              {pending ? "Working…" : `Generate ${t.label}`}
            </Button>
          ))}
          <div className="pt-2 text-xs text-zinc-400">
            If BYOK is configured, generation uses your provider. Otherwise it falls back to Mock Mode.
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Assets" subtitle="Click a type to view. Copy sections fast." />
        <CardBody className="space-y-3">
          {assets.length === 0 ? (
            <div className="text-sm text-zinc-300">No assets yet. Generate one on the left.</div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {assets.slice(0, 8).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => selectAsset(a.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-white/10 ${
                      a.id === selectedId ? "bg-white/10 text-white" : "bg-white/0 text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {a.type}
                    {a.status === "generating" ? "…" : ""}
                  </button>
                ))}
              </div>

              {!selected ? null : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{selected.title}</div>
                    <Badge>{selected.type}</Badge>
                  </div>

                  {selected.status === "generating" ? (
                    <div className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-white/10">
                      <SkeletonLine className="h-4 w-40" />
                      <SkeletonLine className="mt-3 h-3 w-full" />
                      <SkeletonLine className="mt-2 h-3 w-11/12" />
                      <SkeletonLine className="mt-2 h-3 w-10/12" />
                      <SkeletonLine className="mt-2 h-3 w-9/12" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selected.items.map((it) => (
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
                  )}
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

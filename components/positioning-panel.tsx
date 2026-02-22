"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Badge } from "@/components/ui";
import { useToast } from "@/components/toast";
import { SkeletonLine } from "@/components/skeleton";
import { generatePositioningDataAction, type PositioningView } from "@/lib/actions/research-data";

export function PositioningPanel({
  projectId,
  initialPositioning
}: {
  projectId: string;
  initialPositioning: PositioningView | null;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  const [pos, optimisticPos] = useOptimistic(initialPositioning, (state, next) => next);

  function onGenerate() {
    optimisticPos({
      problemStatement: "Generating…",
      valueProp: "Generating…",
      recommendedAngle: "Generating…",
      pricingJson: "{}",
      optionsJson: "[]"
    });

    startTransition(async () => {
      const res = await generatePositioningDataAction(projectId);
      if (!res.ok || !res.positioning) {
        push({ title: "Notice", message: res.error || "Could not generate positioning." });
        router.refresh();
        return;
      }
      optimisticPos(res.positioning);
      push({ title: "Notice", message: "Positioning generated." });
      router.refresh();
    });
  }

  const generating = pos?.problemStatement === "Generating…";

  return (
    <Card>
      <CardHeader
        title="Positioning"
        subtitle="Generate ICP, angles, and pricing hypotheses."
        right={
          <Button disabled={pending} onClick={onGenerate}>
            {pending ? "Working…" : "Generate"}
          </Button>
        }
      />
      <CardBody className="space-y-4">
        {!pos ? (
          <div className="text-sm text-zinc-300">No positioning yet. Click Generate.</div>
        ) : generating ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="mt-3 h-3 w-full" />
              <SkeletonLine className="mt-2 h-3 w-10/12" />
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <SkeletonLine className="h-4 w-40" />
              <SkeletonLine className="mt-3 h-3 w-full" />
              <SkeletonLine className="mt-2 h-3 w-9/12" />
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <SkeletonLine className="h-4 w-36" />
              <SkeletonLine className="mt-3 h-3 w-7/12" />
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-zinc-400">Problem</div>
              <div className="mt-2 text-sm text-zinc-200">{pos.problemStatement}</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-zinc-400">Value proposition</div>
              <div className="mt-2 text-sm text-zinc-200">{pos.valueProp}</div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div>
                <div className="text-xs text-zinc-400">Recommended angle</div>
                <div className="mt-2 text-sm font-semibold text-white">{pos.recommendedAngle}</div>
              </div>
              <Badge>Updated</Badge>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

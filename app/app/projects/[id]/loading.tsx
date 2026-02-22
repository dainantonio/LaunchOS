import { SkeletonCard, SkeletonCardBody, SkeletonCardHeader, SkeletonLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <SkeletonLine className="h-6 w-64" />
          <SkeletonLine className="h-4 w-[520px]" />
        </div>
        <SkeletonLine className="h-4 w-28" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard>
          <SkeletonCardHeader />
          <SkeletonCardBody lines={8} />
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonCardHeader />
          <SkeletonCardBody lines={8} />
        </SkeletonCard>
      </div>
    </div>
  );
}

import { SkeletonCard, SkeletonCardBody, SkeletonCardHeader, SkeletonLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLine className="h-6 w-48" />
          <SkeletonLine className="h-4 w-96" />
        </div>
        <SkeletonLine className="h-4 w-20" />
      </div>

      <SkeletonCard>
        <SkeletonCardHeader />
        <SkeletonCardBody lines={10} />
      </SkeletonCard>
    </div>
  );
}

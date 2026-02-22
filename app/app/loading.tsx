import { Container } from "@/components/ui";
import { SkeletonCard, SkeletonCardBody, SkeletonCardHeader, SkeletonLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Container className="py-8 pb-24 md:pb-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <SkeletonLine className="h-6 w-40" />
              <SkeletonLine className="h-4 w-96" />
              <SkeletonLine className="h-3 w-[520px]" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-36 rounded-xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
              <div className="h-10 w-24 rounded-xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonCard>
              <SkeletonCardHeader />
              <SkeletonCardBody lines={6} />
            </SkeletonCard>

            <SkeletonCard>
              <SkeletonCardHeader />
              <SkeletonCardBody lines={8} />
            </SkeletonCard>
          </div>

          <SkeletonCard>
            <div className="border-b border-white/10 px-5 py-4">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="mt-2 h-3 w-96" />
            </div>
            <SkeletonCardBody lines={10} />
          </SkeletonCard>
        </div>
      </Container>
    </div>
  );
}

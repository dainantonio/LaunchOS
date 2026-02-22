import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-xl bg-white/5 ring-1 ring-white/10",
        className
      )}
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={clsx("h-3 w-full rounded-lg", className)} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={clsx("h-10 w-28 rounded-xl", className)} />;
}

export function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={clsx("rounded-2xl bg-zinc-900/60 shadow-soft ring-1 ring-white/10", className)}>
      {children}
    </div>
  );
}

export function SkeletonCardHeader() {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div className="w-full">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="mt-2 h-3 w-72" />
      </div>
      <SkeletonButton />
    </div>
  );
}

export function SkeletonCardBody({ lines = 4 }: { lines?: number }) {
  return (
    <div className="px-5 py-4">
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} className={i === lines - 1 ? "w-2/3" : ""} />
        ))}
      </div>
    </div>
  );
}

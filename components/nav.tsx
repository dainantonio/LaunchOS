"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/app", label: "Dashboard", key: "dash" }
];

export function AppNav() {
  const pathname = usePathname();
  const isInProjects = pathname.startsWith("/app/projects");
  const active = isInProjects ? "projects" : "dash";

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:gap-2 md:border-r md:border-white/10 md:bg-zinc-950/60 md:p-4">
        <div className="mb-2 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-white/5 p-4 ring-1 ring-white/10">
          <div className="text-sm font-semibold">LaunchOS</div>
          <div className="mt-1 text-xs text-zinc-300">Research → Positioning → Assets → Experiments</div>
        </div>

        <NavItem href="/app" label="Dashboard" active={active === "dash"} />
        <NavItem href="/app/projects/new" label="New Project" active={pathname === "/app/projects/new"} />
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="mx-auto max-w-2xl border-t border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-around">
            <NavItem href="/app" label="Dashboard" active={pathname === "/app"} mobile />
            <NavItem href="/app/projects/new" label="New" active={pathname === "/app/projects/new"} mobile />
          </div>
        </div>
      </div>
    </>
  );
}

function NavItem({ href, label, active, mobile }: { href: string; label: string; active: boolean; mobile?: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-white/10 transition",
        active ? "bg-white/10 text-white" : "bg-white/0 text-zinc-300 hover:bg-white/5 hover:text-white",
        mobile ? "w-[46%] text-center" : ""
      )}
    >
      {label}
    </Link>
  );
}

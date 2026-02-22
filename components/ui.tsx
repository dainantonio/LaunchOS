import clsx from "clsx";

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-6xl px-4", className)}>{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl bg-zinc-900/60 shadow-soft ring-1 ring-white/10 backdrop-blur", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div>
        <div className="text-base font-semibold">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-zinc-300">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("px-5 py-4", className)}>{children}</div>;
}

export function Button({
  children,
  variant = "primary",
  type = "button",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles =
    variant === "primary"
      ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
      : variant === "danger"
      ? "bg-rose-500 text-white hover:bg-rose-400"
      : "bg-white/0 text-zinc-100 hover:bg-white/5 ring-1 ring-white/10";
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60 disabled:opacity-50",
        styles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 ring-1 ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full min-h-[120px] rounded-xl bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 ring-1 ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50",
        props.className
      )}
    />
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-200 ring-1 ring-white/10">{children}</span>;
}

export function Divider() {
  return <div className="my-4 h-px w-full bg-white/10" />;
}

"use client";

import { useToast } from "@/components/toast";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const { push } = useToast();

  return (
    <button
      type="button"
      className="rounded-lg bg-white/5 px-2 py-1 text-xs text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        push({ title: "Copied", message: "Copied to clipboard." });
      }}
    >
      {label}
    </button>
  );
}

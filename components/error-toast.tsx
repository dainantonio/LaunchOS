"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

export function ErrorToast({ message, replaceTo }: { message?: string; replaceTo: string }) {
  const router = useRouter();
  const { push } = useToast();

  useEffect(() => {
    if (!message) return;

    // Some of your redirects use ?error= for “success-ish” notices too.
    // Title stays neutral.
    push({ title: "Notice", message });

    // Clean the URL so refresh doesn’t re-toast.
    router.replace(replaceTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return null;
}

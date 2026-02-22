"use client";

import { useEffect } from "react";
import { useToast } from "@/components/toast";

export default function VariantClient({ variantId }: { variantId: string }) {
  const { push } = useToast();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variantId, type: "VIEW" })
    }).catch(() => {});
  }, [variantId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form || form.tagName !== "FORM") return;
      // if this is the email form, intercept
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement | null;
      if (!emailInput) return;

      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;

      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, type: "SIGNUP", email })
      })
        .then(() => {
          push({ title: "Captured", message: "Signup recorded for this variant." });
          emailInput.value = "";
        })
        .catch(() => push({ title: "Error", message: "Could not record signup." }));
    };

    // Delegated submit handler within page
    document.addEventListener("submit", handler, true);
    return () => document.removeEventListener("submit", handler, true);
  }, [variantId, push]);

  // CTA click tracking could be added to a dedicated button; email submit counts as SIGNUP.
  return null;
}

"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { asAIProvider, asPlanTier } from "@/lib/constants";
import { redirect } from "next/navigation";

export async function setPlanAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "OWNER") throw new Error("FORBIDDEN");

  const tier = asPlanTier(String(formData.get("tier") || "FREE"));

  await prisma.plan.upsert({
    where: { workspaceId: session.workspaceId },
    update: { tier },
    create: { workspaceId: session.workspaceId, tier, status: "active" }
  });

  redirect("/app");
}

export async function saveAISettingsAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "OWNER") throw new Error("FORBIDDEN");

  const provider = asAIProvider(String(formData.get("aiProvider") || "MOCK"));
  const aiKey = String(formData.get("aiKey") || "").trim();
  const aiModel = String(formData.get("aiModel") || "").trim();

  await prisma.workspace.update({
    where: { id: session.workspaceId },
    data: {
      aiProvider: provider,
      aiKey: aiKey || null,
      aiModel: aiModel || null
    }
  });

  redirect("/app");
}

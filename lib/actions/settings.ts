"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PlanTier } from "@prisma/client";
import { redirect } from "next/navigation";

export async function setPlanAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "OWNER") throw new Error("FORBIDDEN");

  const tier = String(formData.get("tier") || "FREE") as PlanTier;
  await prisma.plan.upsert({
    where: { workspaceId: session.workspaceId },
    update: { tier },
    create: { workspaceId: session.workspaceId, tier, status: "active" }
  });

  redirect("/app");
}

export async function saveAIKeyAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "OWNER") throw new Error("FORBIDDEN");

  const aiKey = String(formData.get("aiKey") || "").trim();
  await prisma.workspace.update({
    where: { id: session.workspaceId },
    data: { aiKey: aiKey || null }
  });

  redirect("/app");
}

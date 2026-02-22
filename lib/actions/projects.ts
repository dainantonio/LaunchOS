"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assertCanCreateProject } from "@/lib/entitlements";
import { redirect } from "next/navigation";

export async function createProjectAction(formData: FormData) {
  const session = await requireSession();
  await assertCanCreateProject(session.workspaceId);

  const name = String(formData.get("name") || "").trim();
  const nicheKeywords = String(formData.get("nicheKeywords") || "").trim();
  const icpGuess = String(formData.get("icpGuess") || "").trim();
  const competitorUrls = String(formData.get("competitorUrls") || "").trim();

  if (!name || !nicheKeywords) throw new Error("Name and niche keywords are required.");

  const project = await prisma.project.create({
    data: {
      workspaceId: session.workspaceId,
      name,
      nicheKeywords,
      icpGuess,
      competitorUrls
    }
  });

  redirect(`/app/projects/${project.id}?tab=research`);
}

export async function addSourceAction(projectId: string, formData: FormData) {
  const session = await requireSession();

  const type = String(formData.get("type") || "NOTES");
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: session.workspaceId }
  });
  if (!project) throw new Error("Not found.");

  if (!title || !content) throw new Error("Title and content are required.");

  await prisma.source.create({
    data: { projectId, type: type as any, title, content }
  });

  redirect(`/app/projects/${projectId}?tab=research`);
}

import { prisma } from "@/lib/db";
import { LIMITS } from "@/lib/plan";
import { PlanTier } from "@prisma/client";

export async function getWorkspaceTier(workspaceId: string): Promise<PlanTier> {
  const plan = await prisma.plan.findUnique({ where: { workspaceId } });
  return plan?.tier ?? "FREE";
}

function monthBounds(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0);
  return { start, end };
}

export async function assertCanCreateProject(workspaceId: string) {
  const tier = await getWorkspaceTier(workspaceId);
  const limits = LIMITS[tier];
  const count = await prisma.project.count({ where: { workspaceId } });
  if (count >= limits.maxProjects) {
    throw new Error(`PLAN_LIMIT: You have reached your project limit for ${tier}.`);
  }
}

export async function assertCanGenerate(workspaceId: string) {
  const tier = await getWorkspaceTier(workspaceId);
  const limits = LIMITS[tier];
  const { start, end } = monthBounds();
  const gens = await prisma.event.count({
    where: { workspaceId, type: "GENERATION", createdAt: { gte: start, lt: end } }
  });
  if (gens >= limits.maxGenerationsPerMonth) {
    throw new Error(`PLAN_LIMIT: You have reached your monthly generation limit for ${tier}.`);
  }
}

export async function assertCanCreateExperiment(workspaceId: string, projectId: string) {
  const tier = await getWorkspaceTier(workspaceId);
  const limits = LIMITS[tier];
  const count = await prisma.experiment.count({ where: { projectId } });
  if (count >= limits.maxExperiments) {
    throw new Error(`PLAN_LIMIT: You have reached your experiment limit for ${tier}.`);
  }
}

export async function recordGeneration(workspaceId: string, projectId?: string) {
  await prisma.event.create({
    data: {
      workspaceId,
      projectId,
      type: "GENERATION"
    }
  });
}

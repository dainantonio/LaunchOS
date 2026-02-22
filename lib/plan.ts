import type { PlanTier } from "@/lib/constants";

export type Limits = {
  maxProjects: number;
  maxGenerationsPerMonth: number;
  maxExperiments: number;
  maxMembers: number;
};

export const LIMITS: Record<PlanTier, Limits> = {
  FREE: { maxProjects: 1, maxGenerationsPerMonth: 10, maxExperiments: 0, maxMembers: 1 },
  SOLO: { maxProjects: 3, maxGenerationsPerMonth: 100, maxExperiments: 3, maxMembers: 1 },
  TEAM: { maxProjects: 10, maxGenerationsPerMonth: 500, maxExperiments: 20, maxMembers: 3 },
  AGENCY: { maxProjects: 50, maxGenerationsPerMonth: 3000, maxExperiments: 10_000, maxMembers: 10 }
};

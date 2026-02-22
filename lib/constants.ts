export const ROLES = ["OWNER", "MEMBER"] as const;
export type Role = typeof ROLES[number];

export const PLAN_TIERS = ["FREE", "SOLO", "TEAM", "AGENCY"] as const;
export type PlanTier = typeof PLAN_TIERS[number];

export const SOURCE_TYPES = ["REVIEW", "FORUM", "COMPETITOR", "NOTES"] as const;
export type SourceType = typeof SOURCE_TYPES[number];

export const ASSET_TYPES = ["LANDING", "PRODUCTHUNT", "APPSTORE", "SOCIAL", "EMAIL"] as const;
export type AssetType = typeof ASSET_TYPES[number];

export const EVENT_TYPES = ["VIEW", "CTA", "SIGNUP", "GENERATION"] as const;
export type EventType = typeof EVENT_TYPES[number];

export const AI_PROVIDERS = ["MOCK", "OPENAI", "ANTHROPIC"] as const;
export type AIProvider = typeof AI_PROVIDERS[number];

export function asPlanTier(v: string | null | undefined): PlanTier {
  return (PLAN_TIERS as readonly string[]).includes(v || "") ? (v as PlanTier) : "FREE";
}

export function asAIProvider(v: string | null | undefined): AIProvider {
  return (AI_PROVIDERS as readonly string[]).includes(v || "") ? (v as AIProvider) : "MOCK";
}

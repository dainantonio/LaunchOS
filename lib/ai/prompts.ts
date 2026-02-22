export function gapFinderPrompt(ctx: {
  nicheKeywords: string;
  icpGuess: string;
  competitorUrls: string;
  sourcesText: string;
}) {
  return `
You are a senior product marketer. Be concrete and tactical. No fluff.

TASK: Analyze the SOURCES and produce output JSON exactly matching the schema.

CONTEXT
Niche keywords: ${ctx.nicheKeywords}
ICP guess: ${ctx.icpGuess}
Competitors: ${ctx.competitorUrls || "(none)"}

SOURCES (pasted text):
${ctx.sourcesText || "(none)"}

OUTPUT JSON SCHEMA:
{
  "wedge": { "one_liner": "", "why_it_wins": ["",""], "target_user": "", "job_to_be_done": "" },
  "pain_clusters": [
    { "label":"", "summary":"", "who":"", "severity_1_5": 1, "frequency_1_5": 1, "evidence_quotes":[""], "current_workarounds":[""] }
  ],
  "willingness_to_pay_signals":[ { "signal":"", "evidence_quotes":[""] } ],
  "feature_gaps":[ { "gap":"", "why_users_care":"", "competitors_missing_it":[""], "mvp_implementation_hint":"" } ],
  "risks":[ { "risk":"", "mitigation":"", "validation_test":"" } ],
  "next_7_days_tests":[ { "test":"", "success_metric":"", "how_to_run":"" } ]
}

Return ONLY valid JSON. No markdown fences.`;
}

export function positioningPrompt(ctx: {
  projectName: string;
  nicheKeywords: string;
  icpGuess: string;
  wedgeOneLiner: string;
}) {
  return `
You are a senior product marketer. Be specific. No fluff.

CONTEXT
Product: ${ctx.projectName}
Niche: ${ctx.nicheKeywords}
ICP guess: ${ctx.icpGuess}
Wedge: ${ctx.wedgeOneLiner}

OUTPUT JSON SCHEMA:
{
  "icp": { "primary":"", "secondary":"", "excluded":[""] },
  "problem_statement": "",
  "value_proposition": "",
  "why_now": ["",""],
  "differentiators": ["",""],
  "objections_and_rebuttals": [ { "objection":"", "rebuttal":"" } ],
  "positioning_options": [
    { "angle_name":"", "headline":"", "subhead":"", "proof_points":[""], "best_channel_fit":[""] }
  ],
  "recommended_angle": "",
  "pricing_hypothesis": { "model":"subscription", "starter_price":"", "pro_price":"", "reasoning":"" },
  "first_offer": { "offer":"", "guarantee_or_risk_reversal":"", "cta":"" }
}

Return ONLY valid JSON. No markdown fences.`;
}

export function variantsPrompt(ctx: { angleA: string; angleB: string }) {
  return `
Generate two A/B variants. Make them meaningfully different.

OUTPUT JSON SCHEMA:
{
  "variants": [
    { "key":"A", "headline":"", "subhead":"", "cta":"", "landing_copy_markdown":"" },
    { "key":"B", "headline":"", "subhead":"", "cta":"", "landing_copy_markdown":"" }
  ],
  "success_metric": "signup_rate",
  "run_instructions": ["", ""]
}

Angle A seed headline: ${ctx.angleA}
Angle B seed headline: ${ctx.angleB}

Return ONLY valid JSON. No markdown fences.`;
}

export function landingAssetPrompt(ctx: {
  projectName: string;
  nicheKeywords: string;
  icp: string;
  angle: string;
  valueProp: string;
}) {
  return `
Write landing page copy optimized for conversion and clarity.

CONTEXT
Product: ${ctx.projectName}
Niche keywords: ${ctx.nicheKeywords}
ICP: ${ctx.icp}
Angle: ${ctx.angle}
Value prop: ${ctx.valueProp}

OUTPUT JSON SCHEMA
{
  "sections": [
    { "key": "hero", "markdown": "" },
    { "key": "problem", "markdown": "" },
    { "key": "solution", "markdown": "" },
    { "key": "how_it_works", "markdown": "" },
    { "key": "pricing", "markdown": "" },
    { "key": "faq", "markdown": "" },
    { "key": "final_cta", "markdown": "" }
  ]
}

Return ONLY valid JSON. No markdown fences.`;
}

export function productHuntPrompt(ctx: { projectName: string; oneLiner: string }) {
  return `
Create a Product Hunt listing.

CONTEXT
Product: ${ctx.projectName}
One-liner: ${ctx.oneLiner}

OUTPUT JSON SCHEMA
{
  "tagline": "",
  "description": "",
  "makers_comment": "",
  "top_3_features": ["", "", ""],
  "who_its_for": ["", "", ""],
  "pricing_blurb": "",
  "ask": "What feedback would help most?",
  "hashtags": ["", "", ""]
}

Return ONLY valid JSON. No markdown fences.`;
}

export function appStorePrompt(ctx: { projectName: string }) {
  return `
Create app-store style copy.

CONTEXT
App: ${ctx.projectName}

OUTPUT JSON SCHEMA
{
  "subtitle": "",
  "promo_text": "",
  "description_long": "",
  "feature_bullets": ["", "", "", "", ""],
  "keywords": ["", "", "", "", "", "", "", ""],
  "privacy_blurb": ""
}

Return ONLY valid JSON. No markdown fences.`;
}

export function socialScriptsPrompt(ctx: { projectName: string; icp: string; cta: string }) {
  return `
Write 10 short-form scripts (TikTok/Reels/Shorts).

CONTEXT
Product: ${ctx.projectName}
ICP: ${ctx.icp}
CTA: ${ctx.cta}

OUTPUT JSON SCHEMA
{
  "scripts": [
    { "hook": "", "beats": ["",""], "on_screen_text": ["",""], "cta": "" }
  ]
}

Rules:
- Exactly 10 scripts.
Return ONLY valid JSON. No markdown fences.`;
}

export function emailSeqPrompt(ctx: { projectName: string; icp: string; activationAction: string }) {
  return `
Write a 5-email onboarding sequence.

CONTEXT
Product: ${ctx.projectName}
ICP: ${ctx.icp}
Activation action: ${ctx.activationAction}

OUTPUT JSON SCHEMA
{
  "emails": [
    { "day": 0, "subject": "", "preview": "", "body_markdown": "", "cta": "" }
  ]
}

Rules:
- Exactly 5 emails: day 0,1,3,5,7
Return ONLY valid JSON. No markdown fences.`;
}

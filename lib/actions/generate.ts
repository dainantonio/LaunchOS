"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assertCanGenerate, assertCanCreateExperiment, recordGeneration } from "@/lib/entitlements";
import {
  mockGapFinder,
  mockPositioning,
  mockLandingAsset,
  mockProductHunt,
  mockAppStore,
  mockSocialScripts,
  mockEmailSequence,
  mockVariants
} from "@/lib/mockGen";
import { AssetType } from "@prisma/client";
import { redirect } from "next/navigation";

export async function generateInsightsAction(projectId: string) {
  const session = await requireSession();
  await assertCanGenerate(session.workspaceId);

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: session.workspaceId },
    include: { sources: true }
  });
  if (!project) throw new Error("Not found.");

  const sourcesText = project.sources.map(s => `# ${s.title}\n${s.content}`).join("\n\n");

  const out = mockGapFinder({
    projectName: project.name,
    nicheKeywords: project.nicheKeywords,
    icpGuess: project.icpGuess,
    competitorUrls: project.competitorUrls,
    sourcesText
  });

  // Replace existing clusters for simplicity
  await prisma.insightCluster.deleteMany({ where: { projectId } });

  for (const c of out.pain_clusters) {
    await prisma.insightCluster.create({
      data: {
        projectId,
        label: c.label,
        summary: c.summary,
        who: c.who,
        severity: c.severity_1_5,
        frequency: c.frequency_1_5,
        evidenceJson: JSON.stringify(c.evidence_quotes),
        workaroundsJson: JSON.stringify(c.current_workarounds)
      }
    });
  }

  // Store wedge + tests into a synthetic "cluster" for demo? We'll store wedge into first cluster summary footer via events.
  await prisma.event.create({
    data: {
      workspaceId: session.workspaceId,
      projectId,
      type: "GENERATION",
      metaJson: JSON.stringify({ kind: "insights", wedge: out.wedge })
    }
  });

  await recordGeneration(session.workspaceId, projectId);

  redirect(`/app/projects/${projectId}?tab=research`);
}

export async function generatePositioningAction(projectId: string) {
  const session = await requireSession();
  await assertCanGenerate(session.workspaceId);

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: session.workspaceId },
    include: { clusters: true }
  });
  if (!project) throw new Error("Not found.");

  const wedgeOneLiner = "A focused wedge that wins with a repeatable workflow.";

  const out = mockPositioning({
    projectName: project.name,
    nicheKeywords: project.nicheKeywords,
    icpGuess: project.icpGuess,
    wedgeOneLiner
  });

  await prisma.positioning.upsert({
    where: { projectId },
    update: {
      icpJson: JSON.stringify(out.icp),
      problemStatement: out.problem_statement,
      valueProp: out.value_proposition,
      whyNowJson: JSON.stringify(out.why_now),
      differentiatorsJson: JSON.stringify(out.differentiators),
      objectionsJson: JSON.stringify(out.objections_and_rebuttals),
      optionsJson: JSON.stringify(out.positioning_options),
      recommendedAngle: out.recommended_angle,
      pricingJson: JSON.stringify(out.pricing_hypothesis),
      offerJson: JSON.stringify(out.first_offer)
    },
    create: {
      projectId,
      icpJson: JSON.stringify(out.icp),
      problemStatement: out.problem_statement,
      valueProp: out.value_proposition,
      whyNowJson: JSON.stringify(out.why_now),
      differentiatorsJson: JSON.stringify(out.differentiators),
      objectionsJson: JSON.stringify(out.objections_and_rebuttals),
      optionsJson: JSON.stringify(out.positioning_options),
      recommendedAngle: out.recommended_angle,
      pricingJson: JSON.stringify(out.pricing_hypothesis),
      offerJson: JSON.stringify(out.first_offer)
    }
  });

  await recordGeneration(session.workspaceId, projectId);

  redirect(`/app/projects/${projectId}?tab=positioning`);
}

export async function generateAssetAction(projectId: string, type: AssetType) {
  const session = await requireSession();
  await assertCanGenerate(session.workspaceId);

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: session.workspaceId },
    include: { positioning: true }
  });
  if (!project) throw new Error("Not found.");

  const pos = project.positioning
    ? {
        icp: JSON.parse(project.positioning.icpJson).primary as string,
        angle: project.positioning.recommendedAngle,
        valueProp: project.positioning.valueProp
      }
    : { icp: project.icpGuess, angle: "Profit & Margin", valueProp: "Ship faster with clarity." };

  let title = "";
  let sections: { key: string; markdown: string }[] = [];

  if (type === "LANDING") {
    const out = mockLandingAsset({
      projectName: project.name,
      nicheKeywords: project.nicheKeywords,
      icp: pos.icp,
      angle: pos.angle,
      valueProp: pos.valueProp
    });
    title = "Landing Page Copy";
    sections = out.sections;
  } else if (type === "PRODUCTHUNT") {
    const out = mockProductHunt({ projectName: project.name, oneLiner: pos.valueProp });
    title = "Product Hunt Listing";
    sections = [
      { key: "tagline", markdown: `**Tagline:** ${out.tagline}` },
      { key: "description", markdown: out.description },
      { key: "makers_comment", markdown: out.makers_comment },
      { key: "features", markdown: `**Top features:**\n- ${out.top_3_features.join("\n- ")}` },
      { key: "who", markdown: `**Who it's for:**\n- ${out.who_its_for.join("\n- ")}` },
      { key: "pricing", markdown: out.pricing_blurb }
    ];
  } else if (type === "APPSTORE") {
    const out = mockAppStore({ projectName: project.name });
    title = "App Store Listing";
    sections = [
      { key: "subtitle", markdown: `**Subtitle:** ${out.subtitle}` },
      { key: "promo_text", markdown: `**Promo:** ${out.promo_text}` },
      { key: "long", markdown: out.description_long },
      { key: "bullets", markdown: `**Features:**\n- ${out.feature_bullets.join("\n- ")}` },
      { key: "keywords", markdown: `**Keywords:** ${out.keywords.join(", ")}` },
      { key: "privacy", markdown: out.privacy_blurb }
    ];
  } else if (type === "SOCIAL") {
    const out = mockSocialScripts({ projectName: project.name, niche: project.nicheKeywords, cta: "Create your first project" });
    title = "Short-form Scripts (10)";
    sections = out.scripts.map((s, i) => ({
      key: `script_${i + 1}`,
      markdown: `### Script ${i + 1}\n**Hook:** ${s.hook}\n\n**Beats:**\n- ${s.beats.join("\n- ")}\n\n**On-screen:**\n- ${s.on_screen_text.join("\n- ")}\n\n**CTA:** ${s.cta}`
    }));
  } else if (type === "EMAIL") {
    const out = mockEmailSequence({ projectName: project.name, activationAction: "Create a project" });
    title = "Email Sequence (5)";
    sections = out.emails.map((e) => ({
      key: `day_${e.day}`,
      markdown: `### Day ${e.day}\n**Subject:** ${e.subject}\n**Preview:** ${e.preview}\n\n${e.body_markdown}\n\n**CTA:** ${e.cta}`
    }));
  }

  // Replace existing asset of same type for simplicity
  await prisma.asset.deleteMany({ where: { projectId, type } });

  const asset = await prisma.asset.create({
    data: { projectId, type, title, items: { create: sections.map(s => ({ sectionKey: s.key, contentMarkdown: s.markdown })) } },
    include: { items: true }
  });

  await recordGeneration(session.workspaceId, projectId);

  redirect(`/app/projects/${projectId}?tab=assets&asset=${asset.id}`);
}

export async function createExperimentWithVariantsAction(projectId: string, formData: FormData) {
  const session = await requireSession();
  await assertCanCreateExperiment(session.workspaceId, projectId);
  await assertCanGenerate(session.workspaceId);

  const name = String(formData.get("name") || "Messaging Test").trim();
  const angleA = String(formData.get("angleA") || "Stop losing margin.").trim();
  const angleB = String(formData.get("angleB") || "Launch in a weekend.").trim();

  const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId: session.workspaceId } });
  if (!project) throw new Error("Not found.");

  const exp = await prisma.experiment.create({
    data: { projectId, name, status: "running" }
  });

  const out = mockVariants({ angleA, angleB });

  for (const v of out.variants) {
    await prisma.variant.create({
      data: {
        experimentId: exp.id,
        key: v.key,
        headline: v.headline,
        subhead: v.subhead,
        cta: v.cta,
        landingCopyMarkdown: v.landing_copy_markdown
      }
    });
  }

  await recordGeneration(session.workspaceId, projectId);

  redirect(`/app/projects/${projectId}?tab=experiments`);
}

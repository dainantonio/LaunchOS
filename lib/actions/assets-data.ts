"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assertCanGenerate, recordGeneration } from "@/lib/entitlements";
import { generateTextWithProvider, parseJsonFromModelText } from "@/lib/ai/client";
import {
  landingAssetPrompt,
  productHuntPrompt,
  appStorePrompt,
  socialScriptsPrompt,
  emailSeqPrompt
} from "@/lib/ai/prompts";
import {
  AssetOut,
  PHOut,
  AppStoreOut,
  SocialScriptsOut,
  EmailSeqOut,
  mockLandingAsset,
  mockProductHunt,
  mockAppStore,
  mockSocialScripts,
  mockEmailSequence
} from "@/lib/mockGen";
import { asAIProvider, type AIProvider, type AssetType } from "@/lib/constants";

type AssetItemView = { id: string; sectionKey: string; contentMarkdown: string };
export type AssetView = {
  id: string;
  type: AssetType;
  title: string;
  createdAt: string;
  items: AssetItemView[];
};

async function getAI(workspaceId: string) {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  const provider = asAIProvider(ws?.aiProvider ?? "MOCK");
  const apiKey = ws?.aiKey ?? "";
  const model =
    ws?.aiModel ??
    (provider === "OPENAI" ? "gpt-4o-mini" : provider === "ANTHROPIC" ? "claude-sonnet-4-6" : "mock");

  return { provider, apiKey, model };
}

async function generateJsonWithFallback<T>(opts: {
  workspaceId: string;
  prompt: string;
  schema: { parse: (x: any) => T };
  mock: () => T;
}) {
  const ai = await getAI(opts.workspaceId);

  if (ai.provider !== "MOCK" && ai.apiKey) {
    try {
      const text = await generateTextWithProvider({
        provider: ai.provider as AIProvider,
        apiKey: ai.apiKey,
        model: ai.model,
        prompt: opts.prompt
      });
      const json = parseJsonFromModelText(text);
      return opts.schema.parse(json);
    } catch {
      // fallback below
    }
  }

  return opts.mock();
}

export async function generateAssetDataAction(
  projectId: string,
  type: AssetType
): Promise<{ ok: boolean; asset?: AssetView; error?: string }> {
  try {
    const session = await requireSession();
    await assertCanGenerate(session.workspaceId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: session.workspaceId },
      include: { positioning: true }
    });
    if (!project) return { ok: false, error: "Project not found." };

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
      const out = await generateJsonWithFallback({
        workspaceId: session.workspaceId,
        prompt: landingAssetPrompt({
          projectName: project.name,
          nicheKeywords: project.nicheKeywords,
          icp: pos.icp,
          angle: pos.angle,
          valueProp: pos.valueProp
        }),
        schema: AssetOut,
        mock: () =>
          mockLandingAsset({
            projectName: project.name,
            nicheKeywords: project.nicheKeywords,
            icp: pos.icp,
            angle: pos.angle,
            valueProp: pos.valueProp
          })
      });
      title = "Landing Page Copy";
      sections = out.sections;
    }

    if (type === "PRODUCTHUNT") {
      const out = await generateJsonWithFallback({
        workspaceId: session.workspaceId,
        prompt: productHuntPrompt({ projectName: project.name, oneLiner: pos.valueProp }),
        schema: PHOut,
        mock: () => mockProductHunt({ projectName: project.name, oneLiner: pos.valueProp })
      });
      title = "Product Hunt Listing";
      sections = [
        { key: "tagline", markdown: `**Tagline:** ${out.tagline}` },
        { key: "description", markdown: out.description },
        { key: "makers_comment", markdown: out.makers_comment },
        { key: "features", markdown: `**Top features:**\n- ${out.top_3_features.join("\n- ")}` },
        { key: "who", markdown: `**Who it's for:**\n- ${out.who_its_for.join("\n- ")}` },
        { key: "pricing", markdown: out.pricing_blurb }
      ];
    }

    if (type === "APPSTORE") {
      const out = await generateJsonWithFallback({
        workspaceId: session.workspaceId,
        prompt: appStorePrompt({ projectName: project.name }),
        schema: AppStoreOut,
        mock: () => mockAppStore({ projectName: project.name })
      });
      title = "App Store Listing";
      sections = [
        { key: "subtitle", markdown: `**Subtitle:** ${out.subtitle}` },
        { key: "promo_text", markdown: `**Promo:** ${out.promo_text}` },
        { key: "long", markdown: out.description_long },
        { key: "bullets", markdown: `**Features:**\n- ${out.feature_bullets.join("\n- ")}` },
        { key: "keywords", markdown: `**Keywords:** ${out.keywords.join(", ")}` },
        { key: "privacy", markdown: out.privacy_blurb }
      ];
    }

    if (type === "SOCIAL") {
      const out = await generateJsonWithFallback({
        workspaceId: session.workspaceId,
        prompt: socialScriptsPrompt({ projectName: project.name, icp: pos.icp, cta: "Start free" }),
        schema: SocialScriptsOut,
        mock: () => mockSocialScripts({ projectName: project.name, niche: project.nicheKeywords, cta: "Start free" })
      });
      title = "Short-form Scripts (10)";
      sections = out.scripts.map((s, i) => ({
        key: `script_${i + 1}`,
        markdown: `### Script ${i + 1}\n**Hook:** ${s.hook}\n\n**Beats:**\n- ${s.beats.join("\n- ")}\n\n**On-screen:**\n- ${s.on_screen_text.join("\n- ")}\n\n**CTA:** ${s.cta}`
      }));
    }

    if (type === "EMAIL") {
      const out = await generateJsonWithFallback({
        workspaceId: session.workspaceId,
        prompt: emailSeqPrompt({ projectName: project.name, icp: pos.icp, activationAction: "Create a project" }),
        schema: EmailSeqOut,
        mock: () => mockEmailSequence({ projectName: project.name, activationAction: "Create a project" })
      });
      title = "Email Sequence (5)";
      sections = out.emails.map((e) => ({
        key: `day_${e.day}`,
        markdown: `### Day ${e.day}\n**Subject:** ${e.subject}\n**Preview:** ${e.preview}\n\n${e.body_markdown}\n\n**CTA:** ${e.cta}`
      }));
    }

    // Keep only one per type (same as your existing behavior)
    await prisma.asset.deleteMany({ where: { projectId, type } });

    const asset = await prisma.asset.create({
      data: {
        projectId,
        type,
        title,
        items: { create: sections.map((s) => ({ sectionKey: s.key, contentMarkdown: s.markdown })) }
      },
      include: { items: true }
    });

    await recordGeneration(session.workspaceId, projectId);

    return {
      ok: true,
      asset: {
        id: asset.id,
        type: asset.type as AssetType,
        title: asset.title,
        createdAt: asset.createdAt.toISOString(),
        items: asset.items.map((it) => ({
          id: it.id,
          sectionKey: it.sectionKey,
          contentMarkdown: it.contentMarkdown
        }))
      }
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Asset generation failed." };
  }
}

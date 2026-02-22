"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assertCanGenerate, recordGeneration } from "@/lib/entitlements";

import { generateTextWithProvider, parseJsonFromModelText } from "@/lib/ai/client";
import { gapFinderPrompt, positioningPrompt } from "@/lib/ai/prompts";
import { asAIProvider, type AIProvider } from "@/lib/constants";

import {
  GapFinderOut,
  PositioningOut,
  mockGapFinder,
  mockPositioning
} from "@/lib/mockGen";

export type SourceView = {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
};

export type ClusterView = {
  id: string;
  label: string;
  summary: string;
  who: string;
  severity: number;
  frequency: number;
};

export type PositioningView = {
  problemStatement: string;
  valueProp: string;
  recommendedAngle: string;
  pricingJson: string;
  optionsJson: string;
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

export async function addSourceDataAction(
  projectId: string,
  input: { type: string; title: string; content: string }
): Promise<{ ok: boolean; source?: SourceView; error?: string }> {
  try {
    const session = await requireSession();

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: session.workspaceId }
    });
    if (!project) return { ok: false, error: "Project not found." };

    const type = (input.type || "NOTES").toUpperCase();
    const title = (input.title || "").trim();
    const content = (input.content || "").trim();
    if (!title || !content) return { ok: false, error: "Title and content are required." };

    const s = await prisma.source.create({
      data: { projectId, type, title, content }
    });

    return {
      ok: true,
      source: {
        id: s.id,
        type: s.type,
        title: s.title,
        content: s.content,
        createdAt: s.createdAt.toISOString()
      }
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Could not add source." };
  }
}

export async function generateInsightsDataAction(
  projectId: string
): Promise<{ ok: boolean; clusters?: ClusterView[]; error?: string }> {
  try {
    const session = await requireSession();
    await assertCanGenerate(session.workspaceId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: session.workspaceId },
      include: { sources: true }
    });
    if (!project) return { ok: false, error: "Project not found." };

    const sourcesText = project.sources.map(s => `# ${s.title}\n${s.content}`).join("\n\n");

    const out = await generateJsonWithFallback({
      workspaceId: session.workspaceId,
      prompt: gapFinderPrompt({
        nicheKeywords: project.nicheKeywords,
        icpGuess: project.icpGuess,
        competitorUrls: project.competitorUrls,
        sourcesText
      }),
      schema: GapFinderOut,
      mock: () =>
        mockGapFinder({
          projectName: project.name,
          nicheKeywords: project.nicheKeywords,
          icpGuess: project.icpGuess,
          competitorUrls: project.competitorUrls,
          sourcesText
        })
    });

    await prisma.insightCluster.deleteMany({ where: { projectId } });

    const created: ClusterView[] = [];
    for (const c of out.pain_clusters) {
      const row = await prisma.insightCluster.create({
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
      created.push({
        id: row.id,
        label: row.label,
        summary: row.summary,
        who: row.who,
        severity: row.severity,
        frequency: row.frequency
      });
    }

    await recordGeneration(session.workspaceId, projectId);
    return { ok: true, clusters: created };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Insight generation failed." };
  }
}

export async function generatePositioningDataAction(
  projectId: string
): Promise<{ ok: boolean; positioning?: PositioningView; error?: string }> {
  try {
    const session = await requireSession();
    await assertCanGenerate(session.workspaceId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: session.workspaceId }
    });
    if (!project) return { ok: false, error: "Project not found." };

    const wedgeOneLiner = "A focused wedge that wins with a repeatable workflow.";

    const out = await generateJsonWithFallback({
      workspaceId: session.workspaceId,
      prompt: positioningPrompt({
        projectName: project.name,
        nicheKeywords: project.nicheKeywords,
        icpGuess: project.icpGuess,
        wedgeOneLiner
      }),
      schema: PositioningOut,
      mock: () =>
        mockPositioning({
          projectName: project.name,
          nicheKeywords: project.nicheKeywords,
          icpGuess: project.icpGuess,
          wedgeOneLiner
        })
    });

    const saved = await prisma.positioning.upsert({
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

    return {
      ok: true,
      positioning: {
        problemStatement: saved.problemStatement,
        valueProp: saved.valueProp,
        recommendedAngle: saved.recommendedAngle,
        pricingJson: saved.pricingJson,
        optionsJson: saved.optionsJson
      }
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Positioning generation failed." };
  }
}

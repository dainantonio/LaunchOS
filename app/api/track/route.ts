import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const { variantId, type, email } = body as { variantId?: string; type?: "VIEW" | "CTA" | "SIGNUP"; email?: string };

  if (!variantId || !type) return NextResponse.json({ ok: false }, { status: 400 });

  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { experiment: { include: { project: true } } }
  });
  if (!variant) return NextResponse.json({ ok: false }, { status: 404 });

  const workspaceId = variant.experiment.project.workspaceId;
  const projectId = variant.experiment.projectId;
  const experimentId = variant.experimentId;

  await prisma.event.create({
    data: {
      workspaceId,
      projectId,
      experimentId,
      variantId,
      type,
      metaJson: email ? JSON.stringify({ email }) : null
    }
  });

  if (type === "SIGNUP" && email) {
    await prisma.lead.create({
      data: { projectId, variantId, email }
    });
  }

  return NextResponse.json({ ok: true });
}

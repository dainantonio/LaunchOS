"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

async function ownerCount(workspaceId: string) {
  return prisma.membership.count({ where: { workspaceId, role: "OWNER" } });
}

export async function promoteMemberDataAction(membershipId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  if (session.role !== "OWNER") return { ok: false, error: "Only owners can promote members." };

  const m = await prisma.membership.findFirst({ where: { id: membershipId, workspaceId: session.workspaceId } });
  if (!m) return { ok: false, error: "Member not found." };
  if (m.role === "OWNER") return { ok: false, error: "That member is already an OWNER." };

  await prisma.membership.update({ where: { id: membershipId }, data: { role: "OWNER" } });
  return { ok: true };
}

export async function demoteOwnerDataAction(membershipId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  if (session.role !== "OWNER") return { ok: false, error: "Only owners can demote owners." };

  const m = await prisma.membership.findFirst({ where: { id: membershipId, workspaceId: session.workspaceId } });
  if (!m) return { ok: false, error: "Member not found." };
  if (m.role !== "OWNER") return { ok: false, error: "That member is not an OWNER." };

  const owners = await ownerCount(session.workspaceId);
  if (owners <= 1) return { ok: false, error: "Cannot demote the last OWNER." };

  await prisma.membership.update({ where: { id: membershipId }, data: { role: "MEMBER" } });
  return { ok: true };
}

export async function removeMemberDataAction(membershipId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  if (session.role !== "OWNER") return { ok: false, error: "Only owners can remove members." };

  const m = await prisma.membership.findFirst({ where: { id: membershipId, workspaceId: session.workspaceId } });
  if (!m) return { ok: false, error: "Member not found." };
  if (m.userId === session.userId) return { ok: false, error: "You can’t remove yourself." };

  if (m.role === "OWNER") {
    const owners = await ownerCount(session.workspaceId);
    if (owners <= 1) return { ok: false, error: "Cannot remove the last OWNER." };
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  return { ok: true };
}

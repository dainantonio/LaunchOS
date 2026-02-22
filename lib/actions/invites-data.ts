"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assertCanInviteMember } from "@/lib/entitlements";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function expiresInDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export type InviteView = {
  id: string;
  email: string;
  token: string;
  expiresAt: string; // ISO
  acceptedAt: string | null; // ISO | null
};

export async function createInviteDataAction(emailRaw: string): Promise<{ ok: boolean; invite?: InviteView; error?: string }> {
  const session = await requireSession();
  if (session.role !== "OWNER") return { ok: false, error: "Only workspace owners can invite members." };

  const email = normalizeEmail(emailRaw || "");
  if (!email || !email.includes("@")) return { ok: false, error: "Please enter a valid email." };

  const existingMember = await prisma.membership.findFirst({
    where: { workspaceId: session.workspaceId, user: { email } },
    include: { user: true }
  });
  if (existingMember) return { ok: false, error: "That email is already a member." };

  const existingInvite = await prisma.workspaceInvite.findFirst({
    where: {
      workspaceId: session.workspaceId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (existingInvite) {
    const updated = await prisma.workspaceInvite.update({
      where: { id: existingInvite.id },
      data: { expiresAt: expiresInDays(7) }
    });
    return {
      ok: true,
      invite: {
        id: updated.id,
        email: updated.email,
        token: updated.token,
        expiresAt: updated.expiresAt.toISOString(),
        acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : null
      }
    };
  }

  try {
    await assertCanInviteMember(session.workspaceId); // counts members only
  } catch (e: any) {
    return { ok: false, error: e?.message || "Plan limit reached." };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const created = await prisma.workspaceInvite.create({
    data: {
      workspaceId: session.workspaceId,
      email,
      role: "MEMBER",
      token,
      expiresAt: expiresInDays(7)
    }
  });

  return {
    ok: true,
    invite: {
      id: created.id,
      email: created.email,
      token: created.token,
      expiresAt: created.expiresAt.toISOString(),
      acceptedAt: created.acceptedAt ? created.acceptedAt.toISOString() : null
    }
  };
}

export async function resendInviteDataAction(inviteId: string): Promise<{ ok: boolean; invite?: InviteView; error?: string }> {
  const session = await requireSession();
  if (session.role !== "OWNER") return { ok: false, error: "Only workspace owners can manage invites." };

  const invite = await prisma.workspaceInvite.findFirst({
    where: { id: inviteId, workspaceId: session.workspaceId }
  });
  if (!invite) return { ok: false, error: "Invite not found." };
  if (invite.acceptedAt) return { ok: false, error: "Invite already accepted." };

  const updated = await prisma.workspaceInvite.update({
    where: { id: inviteId },
    data: { expiresAt: expiresInDays(7) }
  });

  return {
    ok: true,
    invite: {
      id: updated.id,
      email: updated.email,
      token: updated.token,
      expiresAt: updated.expiresAt.toISOString(),
      acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : null
    }
  };
}

export async function revokeInviteDataAction(inviteId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  if (session.role !== "OWNER") return { ok: false, error: "Only workspace owners can manage invites." };

  const invite = await prisma.workspaceInvite.findFirst({
    where: { id: inviteId, workspaceId: session.workspaceId }
  });
  if (!invite) return { ok: false, error: "Invite not found." };

  await prisma.workspaceInvite.delete({ where: { id: inviteId } });
  return { ok: true };
}

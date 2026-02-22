"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assertCanInviteMember } from "@/lib/entitlements";
import { redirect } from "next/navigation";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function expiresInDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function appError(msg: string) {
  redirect("/app?error=" + encodeURIComponent(msg));
}

export async function createInviteAction(formData: FormData) {
  const session = await requireSession();

  // OWNER only (friendly redirect)
  if (session.role !== "OWNER") appError("Only workspace owners can invite members.");

  const email = normalizeEmail(String(formData.get("email") || ""));
  if (!email || !email.includes("@")) appError("Please enter a valid email.");

  // already a member? just return to app
  const existingMember = await prisma.membership.findFirst({
    where: { workspaceId: session.workspaceId, user: { email } },
    include: { user: true }
  });
  if (existingMember) redirect("/app?error=" + encodeURIComponent("That email is already a member."));

  // if there is an active pending invite, refresh it instead of duplicating
  const existingInvite = await prisma.workspaceInvite.findFirst({
    where: {
      workspaceId: session.workspaceId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (existingInvite) {
    await prisma.workspaceInvite.update({
      where: { id: existingInvite.id },
      data: { expiresAt: expiresInDays(7) }
    });
    redirect("/app?error=" + encodeURIComponent("Invite refreshed (expiration extended)."));
  }

  // Plan limit check (members only)
  try {
    await assertCanInviteMember(session.workspaceId);
  } catch (e: any) {
    appError(e?.message || "Plan limit reached.");
  }

  const token = crypto.randomBytes(24).toString("hex");

  await prisma.workspaceInvite.create({
    data: {
      workspaceId: session.workspaceId,
      email,
      role: "MEMBER",
      token,
      expiresAt: expiresInDays(7)
    }
  });

  redirect("/app");
}

export async function resendInviteAction(inviteId: string) {
  const session = await requireSession();
  if (session.role !== "OWNER") appError("Only workspace owners can manage invites.");

  const invite = await prisma.workspaceInvite.findFirst({
    where: { id: inviteId, workspaceId: session.workspaceId }
  });
  if (!invite) appError("Invite not found.");
  if (invite.acceptedAt) redirect("/app?error=" + encodeURIComponent("Invite already accepted."));

  // Resend = extend expiration (does NOT change member count)
  await prisma.workspaceInvite.update({
    where: { id: inviteId },
    data: { expiresAt: expiresInDays(7) }
  });

  redirect("/app?error=" + encodeURIComponent("Invite resent (expiration extended)."));
}

export async function revokeInviteAction(inviteId: string) {
  const session = await requireSession();
  if (session.role !== "OWNER") appError("Only workspace owners can manage invites.");

  const invite = await prisma.workspaceInvite.findFirst({
    where: { id: inviteId, workspaceId: session.workspaceId }
  });
  if (!invite) appError("Invite not found.");

  await prisma.workspaceInvite.delete({ where: { id: inviteId } });
  redirect("/app?error=" + encodeURIComponent("Invite revoked."));
}

// Called from login/signup when invite token exists
export async function acceptInviteForUser(userId: string, token: string) {
  const invite = await prisma.workspaceInvite.findUnique({ where: { token } });
  if (!invite) throw new Error("Invite is invalid.");
  if (invite.acceptedAt) return invite.workspaceId;
  if (invite.expiresAt <= new Date()) throw new Error("Invite expired.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  if (normalizeEmail(user.email) !== normalizeEmail(invite.email)) {
    throw new Error("Invite email does not match your account email.");
  }

  // ENFORCE plan limit on accept too
  await assertCanInviteMember(invite.workspaceId);

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId, workspaceId: invite.workspaceId } },
    update: { role: "MEMBER" },
    create: { userId, workspaceId: invite.workspaceId, role: "MEMBER" }
  });

  await prisma.workspaceInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() }
  });

  return invite.workspaceId;
}

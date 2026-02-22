"use server";

import { prisma } from "@/lib/db";
import { requireSession, createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

function appError(msg: string) {
  redirect("/app?error=" + encodeURIComponent(msg));
}

async function ownerCount(workspaceId: string) {
  return prisma.membership.count({ where: { workspaceId, role: "OWNER" } });
}

export async function switchWorkspaceAction(formData: FormData) {
  const session = await requireSession();
  const workspaceId = String(formData.get("workspaceId") || "").trim();
  if (!workspaceId) appError("Workspace required.");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId, workspaceId }
  });
  if (!membership) appError("You are not a member of that workspace.");

  await createSession(session.userId, workspaceId);
  redirect("/app");
}

export async function promoteMemberAction(membershipId: string) {
  const session = await requireSession();
  if (session.role !== "OWNER") appError("Only workspace owners can promote members.");

  const m = await prisma.membership.findFirst({
    where: { id: membershipId, workspaceId: session.workspaceId }
  });
  if (!m) appError("Member not found.");
  if (m.role === "OWNER") appError("That member is already an OWNER.");

  await prisma.membership.update({
    where: { id: membershipId },
    data: { role: "OWNER" }
  });

  redirect("/app?error=" + encodeURIComponent("Member promoted to OWNER."));
}

export async function demoteOwnerAction(membershipId: string) {
  const session = await requireSession();
  if (session.role !== "OWNER") appError("Only workspace owners can demote owners.");

  const m = await prisma.membership.findFirst({
    where: { id: membershipId, workspaceId: session.workspaceId }
  });
  if (!m) appError("Member not found.");
  if (m.role !== "OWNER") appError("That member is not an OWNER.");

  const owners = await ownerCount(session.workspaceId);
  if (owners <= 1) appError("Cannot demote the last OWNER.");

  await prisma.membership.update({
    where: { id: membershipId },
    data: { role: "MEMBER" }
  });

  redirect("/app?error=" + encodeURIComponent("Owner demoted to MEMBER."));
}

/**
 * Transfer ownership to another member:
 * - Target becomes OWNER
 * - Optionally demote the current user (safer to keep them OWNER by default)
 */
export async function transferOwnershipAction(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "OWNER") appError("Only workspace owners can transfer ownership.");

  const targetMembershipId = String(formData.get("targetMembershipId") || "").trim();
  const demoteSelf = String(formData.get("demoteSelf") || "") === "on";

  if (!targetMembershipId) appError("Choose a member to transfer ownership to.");

  const target = await prisma.membership.findFirst({
    where: { id: targetMembershipId, workspaceId: session.workspaceId },
    include: { user: true }
  });
  if (!target) appError("Target member not found.");

  // Promote target to OWNER if needed
  if (target.role !== "OWNER") {
    await prisma.membership.update({
      where: { id: targetMembershipId },
      data: { role: "OWNER" }
    });
  }

  // Demote self if requested (only if there will still be at least 1 owner)
  if (demoteSelf) {
    const me = await prisma.membership.findFirst({
      where: { userId: session.userId, workspaceId: session.workspaceId }
    });
    if (!me) appError("Your membership not found.");

    const owners = await ownerCount(session.workspaceId);
    if (owners <= 1) appError("Cannot demote yourself as the last OWNER.");

    await prisma.membership.update({
      where: { id: me.id },
      data: { role: "MEMBER" }
    });

    // Refresh session so role updates immediately
    await createSession(session.userId, session.workspaceId);

    redirect("/app?error=" + encodeURIComponent(`Ownership transferred to ${target.user.email}. You are now a MEMBER.`));
  }

  redirect("/app?error=" + encodeURIComponent(`Ownership transferred to ${target.user.email}.`));
}

export async function removeMemberAction(membershipId: string) {
  const session = await requireSession();
  if (session.role !== "OWNER") appError("Only workspace owners can remove members.");

  const m = await prisma.membership.findFirst({
    where: { id: membershipId, workspaceId: session.workspaceId }
  });
  if (!m) appError("Member not found.");
  if (m.userId === session.userId) appError("You cannot remove yourself. Use 'Leave workspace' instead.");

  if (m.role === "OWNER") {
    const owners = await ownerCount(session.workspaceId);
    if (owners <= 1) appError("Cannot remove the last OWNER.");
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  redirect("/app?error=" + encodeURIComponent("Member removed."));
}

export async function leaveWorkspaceAction() {
  const session = await requireSession();

  const m = await prisma.membership.findFirst({
    where: { userId: session.userId, workspaceId: session.workspaceId }
  });
  if (!m) appError("Membership not found.");

  if (m.role === "OWNER") {
    const owners = await ownerCount(session.workspaceId);
    if (owners <= 1) appError("You are the last OWNER. Transfer ownership before leaving.");
  }

  await prisma.membership.delete({ where: { id: m.id } });
  redirect("/auth/login?error=" + encodeURIComponent("You left the workspace."));
}

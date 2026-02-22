"use server";

import { prisma } from "@/lib/db";
import { requireSession, createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

function appError(msg: string) {
  redirect("/app?error=" + encodeURIComponent(msg));
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

export async function removeMemberAction(membershipId: string) {
  const session = await requireSession();
  if (session.role !== "OWNER") appError("Only workspace owners can remove members.");

  const m = await prisma.membership.findFirst({
    where: { id: membershipId, workspaceId: session.workspaceId }
  });
  if (!m) appError("Member not found.");
  if (m.userId === session.userId) appError("You cannot remove yourself. Use 'Leave workspace' instead.");

  // Prevent removing the last OWNER
  if (m.role === "OWNER") {
    const owners = await prisma.membership.count({
      where: { workspaceId: session.workspaceId, role: "OWNER" }
    });
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
    const owners = await prisma.membership.count({
      where: { workspaceId: session.workspaceId, role: "OWNER" }
    });
    if (owners <= 1) appError("You are the last OWNER. Promote someone else to OWNER before leaving.");
  }

  await prisma.membership.delete({ where: { id: m.id } });
  redirect("/auth/login?error=" + encodeURIComponent("You left the workspace."));
}

"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, clearSession } from "@/lib/auth";
import { acceptInviteForUser } from "@/lib/actions/invites";
import { redirect } from "next/navigation";

function loginUrl(inviteToken?: string, error?: string) {
  const params = new URLSearchParams();
  if (inviteToken) params.set("invite", inviteToken);
  if (error) params.set("error", error);
  const qs = params.toString();
  return "/auth/login" + (qs ? `?${qs}` : "");
}

function signupUrl(inviteToken?: string, error?: string) {
  const params = new URLSearchParams();
  if (inviteToken) params.set("invite", inviteToken);
  if (error) params.set("error", error);
  const qs = params.toString();
  return "/auth/signup" + (qs ? `?${qs}` : "");
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const workspaceName = String(formData.get("workspaceName") || "My Workspace").trim();
  const inviteToken = String(formData.get("inviteToken") || "").trim();

  if (!email || !password) {
    redirect(signupUrl(inviteToken, "Email and password are required."));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(signupUrl(inviteToken, "Email already in use. Try logging in instead."));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  // If signing up from an invite, JOIN that workspace (do not create a new one)
  if (inviteToken) {
    try {
      const invitedWorkspaceId = await acceptInviteForUser(user.id, inviteToken);
      await createSession(user.id, invitedWorkspaceId);
      redirect("/app");
    } catch (e: any) {
      redirect(signupUrl(inviteToken, e?.message || "Could not accept invite."));
    }
  }

  // Normal signup creates a new workspace
  await prisma.workspace.create({
    data: {
      name: workspaceName,
      memberships: { create: { userId: user.id, role: "OWNER" } },
      plan: { create: { tier: "FREE", status: "active" } }
    }
  });

  await createSession(user.id);
  redirect("/app");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const inviteToken = String(formData.get("inviteToken") || "").trim();

  if (!email || !password) {
    redirect(loginUrl(inviteToken, "Email and password are required."));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect(loginUrl(inviteToken, "Invalid credentials."));
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    redirect(loginUrl(inviteToken, "Invalid credentials."));
  }

  if (inviteToken) {
    try {
      const invitedWorkspaceId = await acceptInviteForUser(user.id, inviteToken);
      await createSession(user.id, invitedWorkspaceId);
      redirect("/app");
    } catch (e: any) {
      redirect(loginUrl(inviteToken, e?.message || "Could not accept invite."));
    }
  }

  await createSession(user.id);
  redirect("/app");
}

export async function logoutAction() {
  clearSession();
  redirect("/");
}

"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const workspaceName = String(formData.get("workspaceName") || "My Workspace").trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash }
  });

  const ws = await prisma.workspace.create({
    data: {
      name: workspaceName,
      memberships: { create: { userId: user.id, role: "OWNER" } },
      plan: { create: { tier: "FREE", status: "active" } }
    }
  });

  // Create session uses first membership; ensure it exists
  await createSession(user.id);

  redirect("/app");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) throw new Error("Email and password are required.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials.");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials.");

  await createSession(user.id);

  redirect("/app");
}

export async function logoutAction() {
  clearSession();
  redirect("/");
}

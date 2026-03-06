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
    redirect("/auth/signup?error=Email%20and%20password%20are%20required.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/auth/signup?error=Email%20already%20in%20use.%20Try%20logging%20in.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash }
  });

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

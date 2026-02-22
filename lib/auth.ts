import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "launchos_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  workspaceId: string;
  role: "OWNER" | "MEMBER";
};

export async function createSession(userId: string, workspaceId?: string) {
  const membership = workspaceId
    ? await prisma.membership.findFirst({
        where: { userId, workspaceId }
      })
    : await prisma.membership.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" }
      });

  if (!membership) throw new Error("No workspace membership found.");

  const payload: SessionPayload = {
    userId,
    workspaceId: membership.workspaceId,
    role: (membership.role === "OWNER" ? "OWNER" : "MEMBER")
  };

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return payload;
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = String(payload.userId || "");
    const workspaceId = String(payload.workspaceId || "");
    if (!userId || !workspaceId) return null;

    // ✅ Always fetch current role from DB (so promotions apply instantly)
    const membership = await prisma.membership.findFirst({
      where: { userId, workspaceId }
    });
    if (!membership) return null;

    const role = membership.role === "OWNER" ? "OWNER" : "MEMBER";
    return { userId, workspaceId, role };
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  return s;
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

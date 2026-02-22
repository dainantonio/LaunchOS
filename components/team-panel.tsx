"use client";

import { useMemo, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Input } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { SubmitButton } from "@/components/submit-button";
import { useToast } from "@/components/toast";
import type { InviteView } from "@/lib/actions/invites-data";
import { createInviteDataAction, resendInviteDataAction, revokeInviteDataAction } from "@/lib/actions/invites-data";
import { promoteMemberDataAction, demoteOwnerDataAction, removeMemberDataAction } from "@/lib/actions/workspace-data";

type MemberView = {
  id: string;
  userId: string;
  email: string;
  role: "OWNER" | "MEMBER";
};

type Props = {
  baseUrl: string;
  isOwner: boolean;
  canHaveTeam: boolean;
  maxMembers: number;
  currentUserId: string;
  members: MemberView[];
  invites: InviteView[];
};

type InvAction =
  | { type: "add_temp"; temp: InviteView & { id: string } }
  | { type: "replace"; tempId: string; real: InviteView }
  | { type: "remove"; id: string }
  | { type: "update"; invite: InviteView };

type MemAction =
  | { type: "set_role"; id: string; role: "OWNER" | "MEMBER" }
  | { type: "remove"; id: string }
  | { type: "restore_all"; snapshot: MemberView[] };

export function TeamPanel(props: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();

  const ownerCount = useMemo(() => props.members.filter(m => m.role === "OWNER").length, [props.members]);

  const [invites, optimisticInv] = useOptimistic(props.invites, (state: InviteView[], action: InvAction) => {
    if (action.type === "add_temp") return [action.temp, ...state];
    if (action.type === "replace") return state.map(i => (i.id === action.tempId ? action.real : i));
    if (action.type === "remove") return state.filter(i => i.id !== action.id);
    if (action.type === "update") return state.map(i => (i.id === action.invite.id ? action.invite : i));
    return state;
  });

  const [members, optimisticMem] = useOptimistic(props.members, (state: MemberView[], action: MemAction) => {
    if (action.type === "set_role") return state.map(m => (m.id === action.id ? { ...m, role: action.role } : m));
    if (action.type === "remove") return state.filter(m => m.id !== action.id);
    if (action.type === "restore_all") return action.snapshot;
    return state;
  });

  const pendingInvites = invites.filter(i => !i.acceptedAt);

  async function onCreateInvite(formData: FormData) {
    const email = String(formData.get("email") || "").trim();
    if (!email) return;

    const tempId = `temp_${Date.now()}`;
    const temp: InviteView = {
      id: tempId,
      email,
      token: "pending",
      expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
      acceptedAt: null
    };

    optimisticInv({ type: "add_temp", temp });

    startTransition(async () => {
      const res = await createInviteDataAction(email);
      if (!res.ok || !res.invite) {
        optimisticInv({ type: "remove", id: tempId });
        push({ title: "Notice", message: res.error || "Could not create invite." });
        return;
      }
      optimisticInv({ type: "replace", tempId, real: res.invite });
      push({ title: "Notice", message: "Invite created." });
      router.refresh();
    });
  }

  function onResendInvite(inviteId: string) {
    startTransition(async () => {
      const res = await resendInviteDataAction(inviteId);
      if (!res.ok || !res.invite) {
        push({ title: "Notice", message: res.error || "Could not resend invite." });
        return;
      }
      optimisticInv({ type: "update", invite: res.invite });
      push({ title: "Notice", message: "Invite resent (expiration extended)." });
      router.refresh();
    });
  }

  function onRevokeInvite(inviteId: string) {
    const snapshot = invites;
    optimisticInv({ type: "remove", id: inviteId });

    startTransition(async () => {
      const res = await revokeInviteDataAction(inviteId);
      if (!res.ok) {
        // revert
        snapshot.forEach(i => optimisticInv({ type: "update", invite: i }));
        push({ title: "Notice", message: res.error || "Could not revoke invite." });
        router.refresh();
        return;
      }
      push({ title: "Notice", message: "Invite revoked." });
      router.refresh();
    });
  }

  function onPromote(membershipId: string) {
    const snapshot = members;
    optimisticMem({ type: "set_role", id: membershipId, role: "OWNER" });

    startTransition(async () => {
      const res = await promoteMemberDataAction(membershipId);
      if (!res.ok) {
        optimisticMem({ type: "restore_all", snapshot });
        push({ title: "Notice", message: res.error || "Could not promote member." });
        router.refresh();
        return;
      }
      push({ title: "Notice", message: "Member promoted to OWNER." });
      router.refresh();
    });
  }

  function onDemote(membershipId: string) {
    const snapshot = members;
    optimisticMem({ type: "set_role", id: membershipId, role: "MEMBER" });

    startTransition(async () => {
      const res = await demoteOwnerDataAction(membershipId);
      if (!res.ok) {
        optimisticMem({ type: "restore_all", snapshot });
        push({ title: "Notice", message: res.error || "Could not demote owner." });
        router.refresh();
        return;
      }
      push({ title: "Notice", message: "Owner demoted to MEMBER." });
      router.refresh();
    });
  }

  function onRemove(membershipId: string) {
    const snapshot = members;
    optimisticMem({ type: "remove", id: membershipId });

    startTransition(async () => {
      const res = await removeMemberDataAction(membershipId);
      if (!res.ok) {
        optimisticMem({ type: "restore_all", snapshot });
        push({ title: "Notice", message: res.error || "Could not remove member." });
        router.refresh();
        return;
      }
      push({ title: "Notice", message: "Member removed." });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="text-sm font-semibold">Members</div>
        <div className="mt-2 space-y-2">
          {members.map(m => {
            const isSelf = m.userId === props.currentUserId;
            const canPromote = props.isOwner && m.role === "MEMBER";
            const canDemote = props.isOwner && m.role === "OWNER" && ownerCount > 1;
            const canRemove = props.isOwner && !isSelf;

            return (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-950/40 p-3 ring-1 ring-white/10">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.email}</div>
                  <div className="text-xs text-zinc-400">
                    {m.role}{isSelf ? " · You" : ""}{m.role === "OWNER" && ownerCount === 1 ? " · (Last owner)" : ""}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Active</Badge>

                  {canPromote ? (
                    <button
                      type="button"
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => onPromote(m.id)}
                    >
                      {isPending ? "Working…" : "Promote"}
                    </button>
                  ) : null}

                  {canDemote ? (
                    <button
                      type="button"
                      className="rounded-xl bg-white/0 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => onDemote(m.id)}
                    >
                      {isPending ? "Working…" : "Demote"}
                    </button>
                  ) : null}

                  {canRemove ? (
                    <button
                      type="button"
                      className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => onRemove(m.id)}
                    >
                      {isPending ? "Working…" : "Remove"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-zinc-500">
          Optimistic UI: changes appear immediately; failures revert automatically.
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">Invites</div>
            <div className="mt-1 text-xs text-zinc-400">
              {props.canHaveTeam
                ? props.isOwner
                  ? `Owner-only. Current members: ${members.length}/${props.maxMembers}`
                  : "Only owners can create invites."
                : "Upgrade to TEAM/AGENCY to invite members."}
            </div>
          </div>
        </div>

        {props.canHaveTeam && props.isOwner ? (
          <form action={onCreateInvite} className="mt-3 flex flex-col gap-2 md:flex-row">
            <Input name="email" type="email" placeholder="teammate@email.com" required />
            <SubmitButton pendingText="Creating…">Create invite</SubmitButton>
          </form>
        ) : null}

        <div className="mt-4 space-y-2">
          {pendingInvites.length === 0 ? (
            <div className="text-sm text-zinc-300">No pending invites.</div>
          ) : (
            pendingInvites.map(inv => {
              const isExpired = new Date(inv.expiresAt) <= new Date();
              const link = inv.token === "pending"
                ? "Creating invite…"
                : `${props.baseUrl}/auth/signup?invite=${inv.token}`;

              return (
                <div key={inv.id} className="rounded-xl bg-zinc-950/40 p-3 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{inv.email}</div>
                      <div className="text-xs text-zinc-400">
                        {inv.token === "pending" ? "Pending…" : isExpired ? "Expired" : `Expires: ${inv.expiresAt.slice(0, 10)}`}
                      </div>
                    </div>

                    {props.isOwner ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-xl bg-white/0 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-50"
                          disabled={isPending || inv.token === "pending"}
                          onClick={() => onResendInvite(inv.id)}
                        >
                          {isPending ? "Working…" : "Resend"}
                        </button>
                        <button
                          type="button"
                          className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
                          disabled={isPending}
                          onClick={() => onRevokeInvite(inv.id)}
                        >
                          {isPending ? "Working…" : "Revoke"}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
                    <div className="truncate text-xs text-zinc-300">{link}</div>
                    {inv.token !== "pending" ? <CopyButton text={link} label="Copy link" /> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

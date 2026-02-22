import Link from "next/link";
import { Container, Card, CardHeader, CardBody, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { signupAction } from "@/lib/actions/auth";

export default function SignupPage({ searchParams }: { searchParams: { invite?: string; error?: string } }) {
  const invite = searchParams?.invite || "";
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <Container className="py-10">
        <Link href="/" className="text-sm text-zinc-300 hover:text-white">← Back</Link>

        <div className="mt-8 max-w-md">
          {error ? (
            <div className="mb-3 rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200 ring-1 ring-rose-400/20">
              {error}
            </div>
          ) : null}

          <Card>
            <CardHeader
              title={invite ? "Accept invite" : "Start free"}
              subtitle={invite ? "Create your account to join the workspace." : "Create a workspace, then generate your first launch kit."}
            />
            <CardBody>
              <form action={signupAction} className="space-y-3">
                {invite ? <input type="hidden" name="inviteToken" value={invite} /> : null}

                {!invite ? (
                  <div>
                    <label className="text-xs text-zinc-400">Workspace name</label>
                    <Input name="workspaceName" placeholder="Acme Studio" defaultValue="My Workspace" />
                  </div>
                ) : null}

                <div>
                  <label className="text-xs text-zinc-400">Email</label>
                  <Input name="email" type="email" placeholder="you@company.com" required />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Password</label>
                  <Input name="password" type="password" placeholder="Create a password" required />
                </div>

                <SubmitButton className="w-full" pendingText="Working…">{invite ? "Join workspace" : "Create account"}</SubmitButton>
              </form>

              <div className="mt-4 text-sm text-zinc-300">
                Already have an account?{" "}
                <Link href={`/auth/login${invite ? `?invite=${invite}` : ""}`} className="text-emerald-300">
                  Log in
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
}

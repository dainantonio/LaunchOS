import Link from "next/link";
import { Container, Card, CardHeader, CardBody, Input, Button } from "@/components/ui";
import { signupAction } from "@/lib/actions/auth";

type SignupPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <Container className="py-10">
        <Link href="/" className="text-sm text-zinc-300 hover:text-white">← Back</Link>

        <div className="mt-8 max-w-md">
          <Card>
            <CardHeader title="Start free" subtitle="Create a workspace, then generate your first launch kit." />
            <CardBody>
              {error ? (
                <div className="mb-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {decodeURIComponent(error)}
                </div>
              ) : null}

              <form action={signupAction} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400">Workspace name</label>
                  <Input name="workspaceName" placeholder="Acme Studio" defaultValue="My Workspace" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Email</label>
                  <Input name="email" type="email" placeholder="you@company.com" required />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Password</label>
                  <Input name="password" type="password" placeholder="Create a password" required />
                </div>
                <Button className="w-full" type="submit">Create account</Button>
              </form>

              <div className="mt-4 text-sm text-zinc-300">
                Already have an account? <Link href="/auth/login" className="text-emerald-300">Log in</Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
}

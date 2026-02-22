import Link from "next/link";
import { Container, Card, CardHeader, CardBody, Input, Button } from "@/components/ui";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <Container className="py-10">
        <Link href="/" className="text-sm text-zinc-300 hover:text-white">← Back</Link>

        <div className="mt-8 max-w-md">
          <Card>
            <CardHeader title="Log in" subtitle="Use demo@launchos.dev / demo1234 after seeding." />
            <CardBody>
              <form action={loginAction} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400">Email</label>
                  <Input name="email" type="email" placeholder="you@company.com" required />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Password</label>
                  <Input name="password" type="password" placeholder="••••••••" required />
                </div>
                <Button className="w-full" type="submit">Continue</Button>
              </form>

              <div className="mt-4 text-sm text-zinc-300">
                New here? <Link href="/auth/signup" className="text-emerald-300">Create an account</Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
}

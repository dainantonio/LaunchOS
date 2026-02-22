import Link from "next/link";
import { Container, Button, Card, CardBody } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <Container className="py-10">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-wide text-zinc-200">LaunchOS</div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Start free</Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Go from <span className="text-emerald-300">signals</span> to a launch kit in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-zinc-300">
              Paste real customer feedback. Generate positioning, landing copy, content scripts, and A/B variants.
              Track conversions. Ship faster with clarity.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/auth/signup">
                <Button>Start free</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost">Use demo</Button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-zinc-400">
              Premium feel. Local-first. No external services required for MVP.
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardBody className="p-0">
              <div className="border-b border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold">Demo Preview</div>
              <div className="p-5">
                <div className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-white/10">
                  <div className="text-xs text-zinc-400">Project</div>
                  <div className="mt-1 text-base font-semibold">NotaryFlow (Demo)</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <div className="text-xs text-zinc-400">Outputs</div>
                      <div className="mt-1 font-semibold">Positioning + Assets</div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <div className="text-xs text-zinc-400">Experiments</div>
                      <div className="mt-1 font-semibold">A/B Variants</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-zinc-300">
                    “Stop guessing. Pick a wedge. Generate assets. Test two headlines. Keep the winner.”
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-3">
          <Feature title="Gap Finder" desc="Turn pasted sources into clustered pains, wedges, and tests." />
          <Feature title="Positioning" desc="ICP, why-now, angles, and pricing hypotheses you can actually test." />
          <Feature title="Launch Kit" desc="Landing copy, Product Hunt, app store, scripts, and emails." />
        </div>
      </Container>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 p-5 ring-1 ring-white/10">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-zinc-300">{desc}</div>
    </div>
  );
}

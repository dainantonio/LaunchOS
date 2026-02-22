import { prisma } from "@/lib/db";
import { Card, CardBody, CardHeader, Button, Input } from "@/components/ui";
import Link from "next/link";
import VariantClient from "./variantClient";

export default async function VariantPage({ params }: { params: { variantId: string } }) {
  const variant = await prisma.variant.findUnique({
    where: { id: params.variantId },
    include: { experiment: { include: { project: true } } }
  });

  if (!variant) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="text-2xl font-semibold text-white">Not found</div>
        <Link className="text-emerald-300" href="/">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="text-xs text-zinc-400">
          Variant {variant.key} · Experiment: {variant.experiment.name}
        </div>

        <Card>
          <CardHeader title={variant.headline} subtitle={variant.subhead} />
          <CardBody className="space-y-4">
            <VariantClient variantId={variant.id} />
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-zinc-200 ring-1 ring-white/10 whitespace-pre-wrap">
              {variant.landingCopyMarkdown}
            </div>

            <div className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-white/10">
              <div className="text-sm font-semibold">Get updates</div>
              <div className="mt-1 text-sm text-zinc-300">Drop your email (tracked as SIGNUP).</div>
              <form className="mt-3 flex gap-2" action="#">
                <Input name="email" type="email" placeholder="you@email.com" required />
                <Button type="submit">{variant.cta}</Button>
              </form>
              <div className="mt-2 text-xs text-zinc-400">This is a demo capture form for A/B testing.</div>
            </div>

            <div className="text-xs text-zinc-500">
              Powered by LaunchOS · <Link className="text-emerald-300" href="/">Learn more</Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

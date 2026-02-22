import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assertCanCreateProject } from "@/lib/entitlements";
import { Card, CardBody, CardHeader, Button } from "@/components/ui";

export default async function NewProjectPage() {
  const session = await requireSession();

  async function createProject(formData: FormData) {
    "use server";
    const s = await requireSession();
    await assertCanCreateProject(s.workspaceId);

    const name = String(formData.get("name") || "").trim();
    const nicheKeywords = String(formData.get("nicheKeywords") || "").trim();
    const icpGuess = String(formData.get("icpGuess") || "").trim();
    const competitorUrls = String(formData.get("competitorUrls") || "").trim();

    if (!name) throw new Error("Name is required.");

    const project = await prisma.project.create({
      data: {
        workspaceId: s.workspaceId,
        name,
        nicheKeywords: nicheKeywords || "notary public software",
        icpGuess: icpGuess || "mobile notaries and signing agents",
        competitorUrls: competitorUrls || ""
      }
    });

    redirect(`/app/projects/${project.id}?tab=research`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">New Project</div>
          <div className="mt-1 text-sm text-zinc-300">Create a project, then add sources and generate assets.</div>
        </div>
        <Link href="/app" className="text-sm text-zinc-300 hover:text-white">← Dashboard</Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader title="Project details" subtitle="These fields guide the mock/AI outputs." />
        <CardBody>
          <form action={createProject} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400">Project name</label>
              <input
                name="name"
                className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10"
                placeholder="NotaryOS"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">Niche keywords</label>
              <input
                name="nicheKeywords"
                className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10"
                placeholder="mobile notary, signing agent, scheduling, journal, invoicing"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">ICP guess</label>
              <input
                name="icpGuess"
                className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10"
                placeholder="solo mobile notaries, small notary teams, signing services"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">Competitor URLs</label>
              <input
                name="competitorUrls"
                className="mt-1 w-full rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-white/10"
                placeholder="https://competitor1.com, https://competitor2.com"
              />
            </div>

            <Button type="submit">Create project</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

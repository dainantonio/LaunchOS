import Link from "next/link";
import { Card, CardBody, CardHeader, Input, Textarea, Button } from "@/components/ui";
import { createProjectAction } from "@/lib/actions/projects";

export default function NewProjectPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">New Project</div>
          <div className="mt-1 text-sm text-zinc-300">Create a project, then add sources and generate outputs.</div>
        </div>
        <Link href="/app" className="text-sm text-zinc-300 hover:text-white">← Back</Link>
      </div>

      <Card>
        <CardHeader title="Project details" subtitle="Narrow wins faster. Pick one niche wedge." />
        <CardBody>
          <form action={createProjectAction} className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400">Project name</label>
              <Input name="name" placeholder="NotaryFlow" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400">Niche keywords (comma-separated)</label>
              <Input name="nicheKeywords" placeholder="mobile notary, travel fees, scheduling, mileage" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400">ICP guess</label>
              <Textarea name="icpGuess" placeholder="Solo mobile notaries doing 10–40 appointments/week" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400">Competitor URLs (optional)</label>
              <Textarea name="competitorUrls" placeholder="https://..., https://..." />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Create project</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

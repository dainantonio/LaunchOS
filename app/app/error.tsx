"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container, Card, CardBody, CardHeader, Button } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Container className="py-10 pb-24 md:pb-10">
        <Card className="max-w-xl">
          <CardHeader title="App error" subtitle="Try again, or return to the dashboard." />
          <CardBody className="space-y-4">
            <div className="rounded-xl bg-white/5 p-3 text-xs text-zinc-300 ring-1 ring-white/10">
              {error.message || "Unknown error"}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Link href="/app">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}

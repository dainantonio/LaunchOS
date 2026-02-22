"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container, Card, CardBody, CardHeader, Button } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // you can add logging later
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Container className="py-10">
        <Card className="max-w-xl">
          <CardHeader title="Something went wrong" subtitle="We hit an unexpected error. Try again or return home." />
          <CardBody className="space-y-4">
            <div className="rounded-xl bg-white/5 p-3 text-xs text-zinc-300 ring-1 ring-white/10">
              {error.message || "Unknown error"}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Link href="/">
                <Button variant="ghost">Go home</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}

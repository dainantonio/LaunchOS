import { AppNav } from "@/components/nav";
import { Container } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="flex">
        <AppNav />
        <div className="flex-1">
          <Container className="py-8 pb-24 md:pb-8">{children}</Container>
        </div>
      </div>
    </div>
  );
}

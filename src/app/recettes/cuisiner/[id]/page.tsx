import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { CookingSession } from "@/features/recipes/types";
import { CookContent } from "./cook-content";

async function CookLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await kv.get<string>(`cook:${id}`);

  if (!raw) notFound();

  const session: CookingSession =
    typeof raw === "string" ? JSON.parse(raw) : raw;

  return <CookContent id={id} initialSession={session} />;
}

export default function CookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="animate-pulse text-muted-foreground">
            Chargement...
          </div>
        </div>
      }
    >
      <CookLoader params={params} />
    </Suspense>
  );
}

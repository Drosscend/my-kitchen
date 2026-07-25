import { notFound } from "next/navigation";
import { Suspense } from "react";
import { readSession } from "@/features/recipes/session-store";
import { CookContent } from "./cook-content";

async function CookLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await readSession(id);

  if (!session) notFound();

  // The server clock travels with the session so the browser can calibrate on
  // the very first render, without waiting for the first poll.
  return (
    <CookContent id={id} initialSession={session} serverNow={Date.now()} />
  );
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

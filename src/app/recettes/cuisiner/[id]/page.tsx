import { notFound } from "next/navigation";
import { Suspense } from "react";
import { readSession } from "@/features/recipes/session-store";
import { CookContent } from "./cook-content";

async function CookLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await readSession(id);

  if (!session) notFound();

  // L'heure du serveur voyage avec la session : le navigateur cale son horloge
  // dessus dès le premier rendu, sans attendre le premier poll.
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

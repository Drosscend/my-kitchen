import { Suspense } from "react";
import { CookContent } from "./cook-content";

export default function CookPage() {
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
      <CookContent />
    </Suspense>
  );
}

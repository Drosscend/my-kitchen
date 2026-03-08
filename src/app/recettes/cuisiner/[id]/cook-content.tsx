"use client";

import { redirect, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CookingMode } from "@/features/recipes/components/cooking-mode";
import { useCookingSession } from "@/features/recipes/hooks/use-cooking-session";
import type { CookingSession } from "@/features/recipes/types";
import { createIngredientMap } from "@/features/recipes/utils";

export function CookContent({
  id,
  initialSession,
}: {
  id: string;
  initialSession: CookingSession;
}) {
  const router = useRouter();
  const session = useCookingSession(id, initialSession);
  const [showQR, setShowQR] = useState(false);

  const ingredientMap = createIngredientMap(session.recipe?.ingredients ?? []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/recettes/cuisiner/${id}`
      : "";

  if (session.closed) {
    redirect("/recettes");
  }

  if (!session.recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper">
        <p className="text-foreground text-lg">Session introuvable</p>
        <p className="text-muted-foreground text-sm">
          Ce lien a peut-être expiré ou n'existe pas.
        </p>
      </div>
    );
  }

  return (
    <>
      <CookingMode
        recipe={session.recipe}
        currentStepIndex={session.currentStepIndex}
        totalSteps={session.recipe.steps.length}
        ingredientMap={ingredientMap}
        scale={session.scale}
        activeTimers={session.activeTimers}
        onPrevStep={session.prevStep}
        onNextStep={session.nextStep}
        onGoToStep={session.goToStep}
        onExit={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/recettes");
          }
        }}
        onStartTimer={session.startTimer}
        onStopTimer={session.stopTimer}
        onResetTimer={session.resetTimer}
        onShare={() => setShowQR(true)}
      />

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="kraft-title text-lg">
              Scanner pour rejoindre
            </DialogTitle>
            <DialogDescription>
              Scannez le QR code ou entrez le code sur un autre appareil
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center rounded-lg bg-white p-4">
            <QRCodeSVG value={shareUrl} size={200} level="M" />
          </div>
          <p className="font-bold font-mono text-2xl text-foreground tracking-[0.3em]">
            {id}
          </p>
          <p className="break-all text-muted-foreground text-xs">{shareUrl}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

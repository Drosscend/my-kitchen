"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCookingMode } from "../hooks/use-cooking-mode";
import { useCookingSession } from "../hooks/use-cooking-session";
import { useRecipes } from "../hooks/use-recipes";
import { useTimers } from "../hooks/use-timers";
import { CookingMode } from "./cooking-mode";
import { RecipeDetail } from "./recipe-detail";
import { RecipeImport } from "./recipe-import";
import { RecipeLibrary } from "./recipe-library";

export function RecipePage() {
  const {
    allRecipes,
    selectedRecipe,
    scale,
    completedSteps,
    isLoading,
    setScale,
    selectRecipe,
    backToLibrary,
    importFromJson,
    deleteRecipe,
    toggleStep,
  } = useRecipes();

  const { activeTimers, startTimer, stopTimer, resetTimer, resetTimers } =
    useTimers();
  const totalSteps = selectedRecipe?.steps.length ?? 0;
  const cookingMode = useCookingMode(totalSteps);
  const [showImport, setShowImport] = useState(false);

  // Shared session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  const session = useCookingSession(sessionId);

  const handleCreateSession = useCallback(async () => {
    if (!selectedRecipe || creatingSession) return;
    setCreatingSession(true);
    try {
      const r = await fetch("/api/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe: selectedRecipe,
          scale,
        }),
      });
      const { id } = await r.json();
      setSessionId(id);
      setShowQR(true);
    } finally {
      setCreatingSession(false);
    }
  }, [selectedRecipe, scale, creatingSession]);

  const handleExitCooking = useCallback(() => {
    if (sessionId) {
      session.close();
    }
    cookingMode.exit();
    resetTimers();
    setSessionId(null);
    setShowQR(false);
  }, [sessionId, session, cookingMode, resetTimers]);

  const ingredientMap = useMemo(() => {
    if (!selectedRecipe) return new Map();
    const map = new Map<string, (typeof selectedRecipe.ingredients)[number]>();
    for (const ing of selectedRecipe.ingredients) {
      if (ing.id) map.set(ing.id, ing);
    }
    return map;
  }, [selectedRecipe]);

  const shareUrl =
    typeof window !== "undefined" && sessionId
      ? `${window.location.origin}/cook/${sessionId}`
      : "";

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // Cooking mode: use synced state if session exists, local state otherwise
  if (
    cookingMode.isActive &&
    selectedRecipe &&
    selectedRecipe.steps.length > 0
  ) {
    const isShared = sessionId !== null && !session.loading;

    return (
      <>
        <CookingMode
          recipe={selectedRecipe}
          currentStepIndex={
            isShared ? session.currentStepIndex : cookingMode.currentStepIndex
          }
          totalSteps={totalSteps}
          ingredientMap={ingredientMap}
          scale={scale}
          activeTimers={isShared ? session.activeTimers : activeTimers}
          onPrevStep={isShared ? session.prevStep : cookingMode.prevStep}
          onNextStep={isShared ? session.nextStep : cookingMode.nextStep}
          onGoToStep={isShared ? session.goToStep : cookingMode.goToStep}
          onExit={handleExitCooking}
          onStartTimer={isShared ? session.startTimer : startTimer}
          onStopTimer={isShared ? session.stopTimer : stopTimer}
          onResetTimer={isShared ? session.resetTimer : resetTimer}
          sessionId={sessionId ?? undefined}
          onShowQR={sessionId ? () => setShowQR(true) : handleCreateSession}
          creatingSession={creatingSession}
        />

        {/* QR Code dialog */}
        <Dialog open={showQR && !!sessionId} onOpenChange={setShowQR}>
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
              {sessionId}
            </p>
            <p className="break-all text-muted-foreground text-xs">
              {shareUrl}
            </p>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Detail view
  if (selectedRecipe) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <RecipeDetail
          recipe={selectedRecipe}
          scale={scale}
          onScaleChange={setScale}
          completedSteps={completedSteps}
          onToggleStep={toggleStep}
          activeTimers={activeTimers}
          onStartTimer={startTimer}
          onStopTimer={stopTimer}
          onResetTimer={resetTimer}
          onEnterCookingMode={cookingMode.enter}
          onBack={() => {
            backToLibrary();
            resetTimers();
          }}
          onDelete={(id) => {
            deleteRecipe(id);
            resetTimers();
          }}
        />
      </div>
    );
  }

  // Library view
  return (
    <div className="mx-auto w-full max-w-4xl">
      {showImport && (
        <div className="mb-6">
          <RecipeImport onImport={importFromJson} />
        </div>
      )}

      <RecipeLibrary
        recipes={allRecipes}
        onSelect={(id) => {
          selectRecipe(id);
          resetTimers();
        }}
        onDelete={deleteRecipe}
        onShowImport={() => setShowImport((v) => !v)}
      />
    </div>
  );
}

"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
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
import { createIngredientMap } from "../utils";
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

  const localTimers = useTimers();
  const totalSteps = selectedRecipe?.steps.length ?? 0;
  const cookingMode = useCookingMode(totalSteps);
  const [showImport, setShowImport] = useState(false);

  // Shared session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const session = useCookingSession(sessionId);

  const isShared = sessionId !== null && !session.loading;

  // Pick synced or local controls
  const controls = isShared
    ? {
        currentStepIndex: session.currentStepIndex,
        activeTimers: session.activeTimers,
        prevStep: session.prevStep,
        nextStep: session.nextStep,
        goToStep: session.goToStep,
        startTimer: session.startTimer,
        stopTimer: session.stopTimer,
        resetTimer: session.resetTimer,
      }
    : {
        currentStepIndex: cookingMode.currentStepIndex,
        activeTimers: localTimers.activeTimers,
        prevStep: cookingMode.prevStep,
        nextStep: cookingMode.nextStep,
        goToStep: cookingMode.goToStep,
        startTimer: localTimers.startTimer,
        stopTimer: localTimers.stopTimer,
        resetTimer: localTimers.resetTimer,
      };

  async function handleCreateSession() {
    if (!selectedRecipe || creatingSession) return;
    setCreatingSession(true);
    try {
      const r = await fetch("/api/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: selectedRecipe, scale }),
      });
      const { id } = await r.json();
      setSessionId(id);
      setShowQR(true);
    } finally {
      setCreatingSession(false);
    }
  }

  function handleExitCooking() {
    if (sessionId) session.close();
    cookingMode.exit();
    localTimers.resetTimers();
    setSessionId(null);
    setShowQR(false);
  }

  const ingredientMap = createIngredientMap(selectedRecipe?.ingredients ?? []);

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

  // Cooking mode
  if (
    cookingMode.isActive &&
    selectedRecipe &&
    selectedRecipe.steps.length > 0
  ) {
    return (
      <>
        <CookingMode
          recipe={selectedRecipe}
          currentStepIndex={controls.currentStepIndex}
          totalSteps={totalSteps}
          ingredientMap={ingredientMap}
          scale={scale}
          activeTimers={controls.activeTimers}
          onPrevStep={controls.prevStep}
          onNextStep={controls.nextStep}
          onGoToStep={controls.goToStep}
          onExit={handleExitCooking}
          onStartTimer={controls.startTimer}
          onStopTimer={controls.stopTimer}
          onResetTimer={controls.resetTimer}
          sessionId={sessionId ?? undefined}
          onShowQR={sessionId ? () => setShowQR(true) : handleCreateSession}
          creatingSession={creatingSession}
        />

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
          activeTimers={localTimers.activeTimers}
          onStartTimer={localTimers.startTimer}
          onStopTimer={localTimers.stopTimer}
          onResetTimer={localTimers.resetTimer}
          onEnterCookingMode={cookingMode.enter}
          onBack={() => {
            backToLibrary();
            localTimers.resetTimers();
          }}
          onDelete={(id) => {
            deleteRecipe(id);
            localTimers.resetTimers();
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
          localTimers.resetTimers();
        }}
        onDelete={deleteRecipe}
        onShowImport={() => setShowImport((v) => !v)}
      />
    </div>
  );
}

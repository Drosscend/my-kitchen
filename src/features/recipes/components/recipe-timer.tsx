"use client";

import { CheckIcon, PlayIcon, SquareIcon } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { TimerState } from "../types";
import { formatDuration, formatTimer } from "../utils";

interface RecipeTimerProps {
  id: string;
  duration: number;
  timer?: TimerState;
  onStart: (id: string, duration: number) => void;
  onStop: (id: string) => void;
  size?: "default" | "large";
}

export function RecipeTimer({
  id,
  duration,
  timer,
  onStart,
  onStop,
  size = "default",
}: RecipeTimerProps) {
  const isRunning = timer?.running ?? false;
  const remaining = timer?.remaining ?? duration;
  const isDone = isRunning && remaining === 0;

  const handleClick = useCallback(() => {
    if (isRunning) {
      onStop(id);
    } else {
      onStart(id, duration);
    }
  }, [id, duration, isRunning, onStart, onStop]);

  if (size === "large") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div
          className="font-semibold text-5xl text-accent"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatTimer(remaining)}
        </div>
        <div className="text-muted-foreground text-sm">
          {formatDuration(duration)}
        </div>
        <Button
          size="lg"
          variant={isDone ? "secondary" : isRunning ? "outline" : "default"}
          className="mt-2 rounded-full px-6"
          onClick={handleClick}
        >
          {isDone ? "Terminé !" : isRunning ? "Stop" : "Démarrer"}
        </Button>
      </div>
    );
  }

  return (
    <>
      {formatDuration(duration)}{" "}
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          isDone
            ? "Chrono terminé"
            : isRunning
              ? "Arrêter le chrono"
              : "Démarrer le chrono"
        }
        className={`relative top-px inline-flex items-center gap-1 rounded-full px-1.5 text-sm transition-colors ${
          isDone
            ? "bg-accent/20 text-accent"
            : isRunning
              ? "bg-accent/15 text-accent"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
        }`}
      >
        {isDone ? (
          <CheckIcon className="size-3" />
        ) : isRunning ? (
          <SquareIcon className="size-3" />
        ) : (
          <PlayIcon className="size-3" />
        )}
        {!isDone && (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatTimer(remaining)}
          </span>
        )}
      </button>
    </>
  );
}

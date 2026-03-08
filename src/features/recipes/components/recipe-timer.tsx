"use client";

import { CheckIcon, PlayIcon, RotateCcwIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimerState } from "../types";
import { formatDuration, formatTimer } from "../utils";

interface RecipeTimerProps {
  id: string;
  duration: number;
  timer?: TimerState;
  onStart: (id: string, duration: number) => void;
  onStop: (id: string) => void;
  onReset?: (id: string) => void;
  size?: "default" | "large";
}

export function RecipeTimer({
  id,
  duration,
  timer,
  onStart,
  onStop,
  onReset,
  size = "default",
}: RecipeTimerProps) {
  const isRunning = timer?.running ?? false;
  const isPaused = timer !== undefined && !timer.running && timer.remaining > 0;
  const remaining = timer?.remaining ?? duration;
  const isDone = timer !== undefined && timer.remaining === 0;

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
        <div className="mt-2 flex items-center gap-2">
          {isDone ? (
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-6"
              onClick={() => onReset?.(id)}
            >
              Terminé ! <RotateCcwIcon className="size-4" />
            </Button>
          ) : isPaused ? (
            <>
              <Button
                size="lg"
                className="rounded-full px-6"
                onClick={() => onStart(id, duration)}
              >
                <PlayIcon className="size-4" /> Reprendre
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                onClick={() => onReset?.(id)}
                title="Réinitialiser"
              >
                <RotateCcwIcon />
              </Button>
            </>
          ) : isRunning ? (
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-6"
              onClick={() => onStop(id)}
            >
              <SquareIcon className="size-4" /> Pause
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-full px-6"
              onClick={() => onStart(id, duration)}
            >
              <PlayIcon className="size-4" /> Démarrer
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {formatDuration(duration)}{" "}
      {isDone ? (
        <button
          type="button"
          onClick={() => onReset?.(id)}
          aria-label="Réinitialiser le chrono"
          className="relative top-px inline-flex items-center gap-1 rounded-full bg-accent/20 px-1.5 text-accent text-sm transition-colors"
        >
          <CheckIcon className="size-3" />
        </button>
      ) : isPaused ? (
        <span className="relative top-px inline-flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onStart(id, duration)}
            aria-label="Reprendre le chrono"
            className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-1.5 text-accent text-sm transition-colors hover:bg-accent/25"
          >
            <PlayIcon className="size-3" />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatTimer(remaining)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onReset?.(id)}
            aria-label="Réinitialiser le chrono"
            className="inline-flex items-center rounded-full px-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <RotateCcwIcon className="size-3" />
          </button>
        </span>
      ) : isRunning ? (
        <button
          type="button"
          onClick={() => onStop(id)}
          aria-label="Mettre en pause le chrono"
          className="relative top-px inline-flex items-center gap-1 rounded-full bg-accent/15 px-1.5 text-accent text-sm transition-colors hover:bg-accent/25"
        >
          <SquareIcon className="size-3" />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatTimer(remaining)}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onStart(id, duration)}
          aria-label="Démarrer le chrono"
          className="relative top-px inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted"
        >
          <PlayIcon className="size-3" />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatTimer(remaining)}
          </span>
        </button>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActiveTimers,
  CookingSession,
  CookingSessionState,
  SyncedTimer,
} from "../types";
import { ensureAudioContext, playTimerSound } from "../utils";

function computeTimers(synced: Record<string, SyncedTimer>): ActiveTimers {
  const now = Date.now();
  const result: ActiveTimers = {};
  for (const [id, t] of Object.entries(synced)) {
    if (t.pausedRemaining !== undefined) {
      result[id] = {
        remaining: t.pausedRemaining,
        total: t.total,
        running: false,
      };
    } else {
      const elapsed = Math.floor((now - t.startedAt) / 1000);
      const remaining = Math.max(0, t.total - elapsed);
      result[id] = { remaining, total: t.total, running: remaining > 0 };
    }
  }
  return result;
}

export function useCookingSession(sessionId: string | null) {
  const [data, setData] = useState<CookingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTimers, setActiveTimers] = useState<ActiveTimers>({});
  const lastUpdateRef = useRef(0);
  const prevTimersRef = useRef<ActiveTimers>({});

  // Initial fetch
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/cook/${sessionId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: CookingSession) => {
        setData(d);
        lastUpdateRef.current = d.state.updatedAt;
        setActiveTimers(computeTimers(d.state.activeTimers));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Polling every 500ms
  useEffect(() => {
    if (!data || !sessionId) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/cook/${sessionId}`);
        if (!r.ok) return;
        const d: CookingSession = await r.json();
        if (d.state.updatedAt > lastUpdateRef.current) {
          setData(d);
          lastUpdateRef.current = d.state.updatedAt;
          setActiveTimers(computeTimers(d.state.activeTimers));
        }
      } catch {
        // ignore network errors during polling
      }
    }, 500);
    return () => clearInterval(interval);
  }, [sessionId, data]);

  // Local timer tick (1s) for smooth countdown
  useEffect(() => {
    if (!data) return;
    const hasRunning = Object.values(activeTimers).some(
      (t) => t.running && t.remaining > 0,
    );
    if (!hasRunning) return;
    const interval = setInterval(() => {
      setActiveTimers(computeTimers(data.state.activeTimers));
    }, 1000);
    return () => clearInterval(interval);
  }, [data, activeTimers]);

  // Detect timer completion → play sound
  useEffect(() => {
    const prev = prevTimersRef.current;
    for (const [id, timer] of Object.entries(activeTimers)) {
      if (
        timer.remaining === 0 &&
        prev[id]?.remaining !== undefined &&
        prev[id].remaining > 0
      ) {
        playTimerSound();
        break;
      }
    }
    prevTimersRef.current = activeTimers;
  }, [activeTimers]);

  const updateState = useCallback(
    async (partial: Partial<CookingSessionState>) => {
      if (!data) return;
      const now = Date.now();
      const newState = { ...data.state, ...partial, updatedAt: now };
      const newData = { ...data, state: newState };

      setData(newData);
      lastUpdateRef.current = now;

      if (partial.activeTimers) {
        setActiveTimers(computeTimers(partial.activeTimers));
      }

      await fetch(`/api/cook/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newState),
      });
    },
    [data, sessionId],
  );

  const prevStep = useCallback(() => {
    if (!data) return;
    updateState({
      currentStepIndex: Math.max(-1, data.state.currentStepIndex - 1),
    });
  }, [data, updateState]);

  const nextStep = useCallback(() => {
    if (!data) return;
    updateState({
      currentStepIndex: Math.min(
        data.recipe.steps.length - 1,
        data.state.currentStepIndex + 1,
      ),
    });
  }, [data, updateState]);

  const goToStep = useCallback(
    (index: number) => {
      if (!data) return;
      updateState({
        currentStepIndex: Math.max(
          -1,
          Math.min(data.recipe.steps.length - 1, index),
        ),
      });
    },
    [data, updateState],
  );

  const startTimer = useCallback(
    (id: string, duration: number) => {
      if (!data) return;
      ensureAudioContext();
      const existing = data.state.activeTimers[id];
      const resumeRemaining = existing?.pausedRemaining;
      const now = Date.now();
      const newTimers = {
        ...data.state.activeTimers,
        [id]: {
          total: resumeRemaining ?? duration,
          startedAt: now,
        },
      };
      updateState({ activeTimers: newTimers });
    },
    [data, updateState],
  );

  const stopTimer = useCallback(
    (id: string) => {
      if (!data) return;
      const timer = data.state.activeTimers[id];
      if (!timer) return;
      const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
      const remaining = Math.max(0, timer.total - elapsed);
      const newTimers = {
        ...data.state.activeTimers,
        [id]: { ...timer, pausedRemaining: remaining },
      };
      updateState({ activeTimers: newTimers });
    },
    [data, updateState],
  );

  const resetTimer = useCallback(
    (id: string) => {
      if (!data) return;
      const newTimers = { ...data.state.activeTimers };
      delete newTimers[id];
      updateState({ activeTimers: newTimers });
    },
    [data, updateState],
  );

  const close = useCallback(() => {
    updateState({ closed: true });
  }, [updateState]);

  return {
    loading,
    error,
    closed: data?.state.closed ?? false,
    recipe: data?.recipe ?? null,
    scale: data?.scale ?? 1,
    currentStepIndex: data?.state.currentStepIndex ?? -1,
    completedSteps: data?.state.completedSteps ?? [],
    activeTimers,
    prevStep,
    nextStep,
    goToStep,
    startTimer,
    stopTimer,
    resetTimer,
    close,
  };
}

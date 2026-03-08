"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
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

export function useCookingSession(
  sessionId: string | null,
  initialSession?: CookingSession,
) {
  const [data, setData] = useState<CookingSession | null>(
    initialSession ?? null,
  );
  const [loading, setLoading] = useState(!initialSession);
  const [error, setError] = useState(false);
  const [activeTimers, setActiveTimers] = useState<ActiveTimers>(
    initialSession ? computeTimers(initialSession.state.activeTimers) : {},
  );
  const dataRef = useRef<CookingSession | null>(data);
  const lastUpdateRef = useRef(initialSession?.state.updatedAt ?? 0);
  const prevTimersRef = useRef<ActiveTimers>({});
  const pollingRef = useRef(false);

  dataRef.current = data;

  // Initial fetch (skipped when initialSession is provided)
  useEffect(() => {
    if (!sessionId || initialSession) {
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
  }, [sessionId, initialSession]);

  // Polling every 500ms
  useEffect(() => {
    if (!sessionId || !data) return;
    const interval = setInterval(async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
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
        // ignore network errors
      } finally {
        pollingRef.current = false;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [sessionId, data]);

  // Local timer tick (1s)
  useEffect(() => {
    if (!data) return;
    const hasSyncedRunning = Object.values(data.state.activeTimers).some(
      (t) => t.pausedRemaining === undefined,
    );
    if (!hasSyncedRunning) return;
    const interval = setInterval(() => {
      if (dataRef.current) {
        setActiveTimers(computeTimers(dataRef.current.state.activeTimers));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.state.activeTimers, data]);

  // Timer completion sound
  const onTimerComplete = useEffectEvent(() => {
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
  });

  useEffect(() => {
    onTimerComplete();
  }, []);

  function updateState(partial: Partial<CookingSessionState>) {
    const current = dataRef.current;
    if (!current) return;
    const now = Date.now();
    const newState = { ...current.state, ...partial, updatedAt: now };

    setData({ ...current, state: newState });
    lastUpdateRef.current = now;

    if (partial.activeTimers) {
      setActiveTimers(computeTimers(partial.activeTimers));
    }

    fetch(`/api/cook/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newState),
    });
  }

  function prevStep() {
    const current = dataRef.current;
    if (!current) return;
    updateState({
      currentStepIndex: Math.max(-1, current.state.currentStepIndex - 1),
    });
  }

  function nextStep() {
    const current = dataRef.current;
    if (!current) return;
    updateState({
      currentStepIndex: Math.min(
        current.recipe.steps.length - 1,
        current.state.currentStepIndex + 1,
      ),
    });
  }

  function goToStep(index: number) {
    const current = dataRef.current;
    if (!current) return;
    updateState({
      currentStepIndex: Math.max(
        -1,
        Math.min(current.recipe.steps.length - 1, index),
      ),
    });
  }

  function startTimer(id: string, duration: number) {
    const current = dataRef.current;
    if (!current) return;
    ensureAudioContext();
    const existing = current.state.activeTimers[id];
    const resumeDuration = existing?.pausedRemaining ?? duration;
    updateState({
      activeTimers: {
        ...current.state.activeTimers,
        [id]: { total: resumeDuration, startedAt: Date.now() },
      },
    });
  }

  function stopTimer(id: string) {
    const current = dataRef.current;
    if (!current) return;
    const timer = current.state.activeTimers[id];
    if (!timer) return;
    const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
    const remaining = Math.max(0, timer.total - elapsed);
    updateState({
      activeTimers: {
        ...current.state.activeTimers,
        [id]: { ...timer, pausedRemaining: remaining },
      },
    });
  }

  function resetTimer(id: string) {
    const current = dataRef.current;
    if (!current) return;
    const newTimers = { ...current.state.activeTimers };
    delete newTimers[id];
    updateState({ activeTimers: newTimers });
  }

  function close() {
    updateState({ closed: true });
  }

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

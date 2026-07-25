"use client";

import {
  type RefObject,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type {
  ActiveTimers,
  CookingSession,
  CookingSessionResponse,
  CookingSessionUpdate,
  SyncedTimer,
} from "../types";
import {
  acquireWakeLock,
  ensureAudioContext,
  playTimerSound,
  releaseWakeLock,
} from "../utils";

function useTimerCompletionSound(
  synced: Record<string, SyncedTimer>,
  clockOffsetRef: RefObject<number>,
) {
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const now = Date.now() + clockOffsetRef.current;
    for (const t of Object.values(synced)) {
      if (t.pausedRemaining !== undefined) continue;
      const delay = t.startedAt + t.total * 1000 - now;
      if (delay > 0) timeouts.push(setTimeout(playTimerSound, delay));
    }
    if (timeouts.length === 0) return () => {};

    // Keep the screen on while a timer runs, otherwise mobile throttles
    // setTimeout and blocks navigator.vibrate. The browser auto-releases
    // the lock when the tab is hidden, so reacquire on visibility change.
    acquireWakeLock();
    function onVisibility() {
      if (document.visibilityState === "visible") acquireWakeLock();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      timeouts.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onVisibility);
      releaseWakeLock();
    };
  }, [synced, clockOffsetRef]);
}

function computeTimers(
  synced: Record<string, SyncedTimer>,
  now: number,
): ActiveTimers {
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
  initialServerNow?: number,
) {
  const [data, setData] = useState<CookingSession | null>(
    initialSession ?? null,
  );
  const [loading, setLoading] = useState(!initialSession);
  const [error, setError] = useState(false);
  // Gap between the server clock and this device's. Every date in a session
  // (updatedAt, timer startedAt) is expressed in server time: devices sharing
  // a session have no other common reference, and a local clock easily drifts
  // by several seconds.
  const clockOffsetRef = useRef(
    initialServerNow ? initialServerNow - Date.now() : 0,
  );
  const [activeTimers, setActiveTimers] = useState<ActiveTimers>(
    initialSession
      ? computeTimers(
          initialSession.state.activeTimers,
          Date.now() + clockOffsetRef.current,
        )
      : {},
  );
  const dataRef = useRef<CookingSession | null>(data);
  const lastUpdateRef = useRef(initialSession?.state.updatedAt ?? 0);
  const pollingRef = useRef(false);
  // In-flight PATCH count. A poll response that left before them describes an
  // earlier state, and applying it would undo the step we just changed.
  const pendingRef = useRef(0);

  dataRef.current = data;

  function serverNow() {
    return Date.now() + clockOffsetRef.current;
  }

  const applyRemote = useEffectEvent((session: CookingSessionResponse) => {
    clockOffsetRef.current = session.serverNow - Date.now();
    setData(session);
    lastUpdateRef.current = session.state.updatedAt;
    setActiveTimers(
      computeTimers(
        session.state.activeTimers,
        Date.now() + clockOffsetRef.current,
      ),
    );
  });

  // Initial fetch (skipped when initialSession is provided)
  useEffect(() => {
    if (!sessionId || initialSession) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/cook/${sessionId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: CookingSessionResponse) => {
        applyRemote(d);
      })
      .catch(() => {
        setError(true);
        toast.error("Session introuvable ou expirée.");
      })
      .finally(() => setLoading(false));
  }, [sessionId, initialSession]);

  // Polling every 500ms
  useEffect(() => {
    if (!sessionId || !data) return;
    const interval = setInterval(async () => {
      if (pollingRef.current || pendingRef.current > 0) return;
      pollingRef.current = true;
      try {
        const r = await fetch(`/api/cook/${sessionId}`);
        if (!r.ok) return;
        const d: CookingSessionResponse = await r.json();
        // A local change sent while this request was in flight describes a more
        // recent state, so it wins.
        if (pendingRef.current > 0) return;
        if (d.state.updatedAt > lastUpdateRef.current) applyRemote(d);
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
        setActiveTimers(
          computeTimers(
            dataRef.current.state.activeTimers,
            Date.now() + clockOffsetRef.current,
          ),
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.state.activeTimers, data]);

  useTimerCompletionSound(data?.state.activeTimers ?? {}, clockOffsetRef);

  function updateState(update: CookingSessionUpdate) {
    const current = dataRef.current;
    if (!current || !sessionId) return;

    // Optimistic update: the screen reacts at once, the server stamps and
    // confirms. updatedAt keeps its server value in the meantime.
    setData({ ...current, state: { ...current.state, ...update } });
    if (update.activeTimers) {
      setActiveTimers(computeTimers(update.activeTimers, serverNow()));
    }

    pendingRef.current += 1;
    fetch(`/api/cook/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: CookingSessionResponse) => {
        // The confirmed state comes back through the poll, which resumes as
        // soon as nothing is in flight. Only the clock is calibrated here.
        clockOffsetRef.current = d.serverNow - Date.now();
      })
      .catch(() => {
        toast.error("Erreur de synchronisation.");
        // The local state was never accepted, so the next poll has to reapply
        // the server one even though it has not changed since.
        lastUpdateRef.current = 0;
      })
      .finally(() => {
        pendingRef.current -= 1;
      });
  }

  function prevStep() {
    const current = dataRef.current;
    if (!current) return;
    ensureAudioContext();
    updateState({
      currentStepIndex: Math.max(-1, current.state.currentStepIndex - 1),
    });
  }

  function nextStep() {
    const current = dataRef.current;
    if (!current) return;
    ensureAudioContext();
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
    ensureAudioContext();
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
        [id]: { total: resumeDuration, startedAt: serverNow() },
      },
    });
  }

  function stopTimer(id: string) {
    const current = dataRef.current;
    if (!current) return;
    const timer = current.state.activeTimers[id];
    if (!timer) return;
    const elapsed = Math.floor((serverNow() - timer.startedAt) / 1000);
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

"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { ActiveTimers } from "../types";
import { ensureAudioContext, playTimerSound } from "../utils";

export function useTimers() {
  const [activeTimers, setActiveTimers] = useState<ActiveTimers>({});
  const prevTimersRef = useRef<ActiveTimers>({});

  const hasRunningTimer = Object.values(activeTimers).some(
    (t) => t.running && t.remaining > 0,
  );

  // Tick every second
  useEffect(() => {
    if (!hasRunningTimer) return;
    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const k of Object.keys(next)) {
          if (next[k].running && next[k].remaining > 0) {
            next[k] = { ...next[k], remaining: next[k].remaining - 1 };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasRunningTimer]);

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
  }, [activeTimers]);

  function startTimer(id: string, duration: number) {
    ensureAudioContext();
    setActiveTimers((prev) => {
      const existing = prev[id];
      const remaining =
        existing && !existing.running && existing.remaining > 0
          ? existing.remaining
          : duration;
      return {
        ...prev,
        [id]: { remaining, total: duration, running: true },
      };
    });
  }

  function stopTimer(id: string) {
    setActiveTimers((prev) => {
      const timer = prev[id];
      if (!timer) return prev;
      return {
        ...prev,
        [id]: { ...timer, running: false },
      };
    });
  }

  function resetTimer(id: string) {
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function resetTimers() {
    setActiveTimers({});
  }

  return { activeTimers, startTimer, stopTimer, resetTimer, resetTimers };
}

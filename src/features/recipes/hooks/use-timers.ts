"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  // Detect timer completion → play sound
  useEffect(() => {
    const prev = prevTimersRef.current;
    for (const [id, timer] of Object.entries(activeTimers)) {
      if (
        timer.running &&
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

  const startTimer = useCallback((id: string, duration: number) => {
    ensureAudioContext();
    setActiveTimers((prev) => ({
      ...prev,
      [id]: { remaining: duration, total: duration, running: true },
    }));
  }, []);

  const stopTimer = useCallback((id: string) => {
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const resetTimers = useCallback(() => {
    setActiveTimers({});
  }, []);

  return { activeTimers, startTimer, stopTimer, resetTimers };
}

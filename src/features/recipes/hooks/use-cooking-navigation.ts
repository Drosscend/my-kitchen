"use client";

import { useEffect, useRef } from "react";

interface CookingNavigationOptions {
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function useCookingNavigation({
  onPrev,
  onNext,
  onExit,
  canGoPrev,
  canGoNext,
}: CookingNavigationOptions) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext, onExit]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0 && canGoNext) onNext();
    else if (dx > 0 && canGoPrev) onPrev();
  }

  return { handleTouchStart, handleTouchEnd };
}

"use client";

import { useCallback, useEffect, useState } from "react";

export function useCookingMode(totalSteps: number) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const enter = useCallback(() => {
    setCurrentStepIndex(-1);
    setIsActive(true);
  }, []);

  const exit = useCallback(() => {
    setIsActive(false);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(-1, i - 1));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((i) => Math.min(totalSteps - 1, i + 1));
  }, [totalSteps]);

  // Lock body scroll
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isActive]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentStepIndex((i) => Math.max(-1, i - 1));
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentStepIndex((i) => Math.min(totalSteps - 1, i + 1));
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsActive(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, totalSteps]);

  return {
    isActive,
    currentStepIndex,
    enter,
    exit,
    prevStep,
    nextStep,
  };
}

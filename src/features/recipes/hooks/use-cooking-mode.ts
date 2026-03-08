"use client";

import { useEffect, useState } from "react";

export function useCookingMode(totalSteps: number) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  function enter() {
    setCurrentStepIndex(-1);
    setIsActive(true);
  }

  function exit() {
    setIsActive(false);
  }

  function prevStep() {
    setCurrentStepIndex((i) => Math.max(-1, i - 1));
  }

  function nextStep() {
    setCurrentStepIndex((i) => Math.min(totalSteps - 1, i + 1));
  }

  function goToStep(index: number) {
    setCurrentStepIndex(Math.max(-1, Math.min(totalSteps - 1, index)));
  }

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
    goToStep,
  };
}

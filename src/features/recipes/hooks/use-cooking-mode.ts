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

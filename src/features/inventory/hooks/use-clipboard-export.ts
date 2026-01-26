"use client";

import { useCallback, useState } from "react";
import type { Ingredient } from "../types";
import { formatForClipboard } from "../utils";

export function useClipboardExport() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (ingredients: Ingredient[]) => {
    const text = formatForClipboard(ingredients);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  }, []);

  return {
    copied,
    handleCopy,
  };
}

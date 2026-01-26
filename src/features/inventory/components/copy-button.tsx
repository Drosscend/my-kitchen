"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboardExport } from "../hooks/use-clipboard-export";
import type { Ingredient } from "../types";

interface CopyButtonProps {
  ingredients: Ingredient[];
}

export function CopyButton({ ingredients }: CopyButtonProps) {
  const { copied, handleCopy } = useClipboardExport();

  return (
    <Button
      variant="outline"
      onClick={() => handleCopy(ingredients)}
      disabled={ingredients.length === 0}
      className="w-full justify-start gap-2"
    >
      {copied ? (
        <>
          <CheckIcon className="size-4 text-accent" />
          Copié !
        </>
      ) : (
        <>
          <CopyIcon className="size-4" />
          Copier
        </>
      )}
    </Button>
  );
}

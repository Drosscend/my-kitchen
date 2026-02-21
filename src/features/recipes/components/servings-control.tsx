"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

interface ServingsControlProps {
  servings: number;
  scale: number;
  baseServings: number;
  onScaleChange: (scale: number) => void;
}

export function ServingsControl({
  servings,
  scale,
  baseServings,
  onScaleChange,
}: ServingsControlProps) {
  const step = 1 / baseServings;

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Portions</span>
      <InputGroup className="w-auto">
        <InputGroupAddon align="inline-start">
          <InputGroupButton
            onClick={() => onScaleChange(Math.max(step, scale - step))}
            disabled={scale <= step}
            aria-label="Diminuer les portions"
          >
            <MinusIcon />
          </InputGroupButton>
        </InputGroupAddon>
        <span
          className="flex min-w-6 items-center justify-center px-2 text-center text-foreground text-xs"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {servings}
        </span>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={() => onScaleChange(Math.min(10, scale + step))}
            disabled={scale >= 10}
            aria-label="Augmenter les portions"
          >
            <PlusIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

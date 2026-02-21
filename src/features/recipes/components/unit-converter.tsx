"use client";

import { ArrowRightLeftIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  convert,
  INGREDIENT_DENSITIES,
  UNIT_MAP,
  UNITS,
  type UnitId,
} from "../conversion-data";

function needsDensity(from: UnitId, to: UnitId) {
  return UNIT_MAP[from].dimension !== UNIT_MAP[to].dimension;
}

function formatResult(value: number): string {
  if (Number.isInteger(value)) return value.toString();
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 1) return value.toFixed(2);
  return value.toFixed(3);
}

export function UnitConverter() {
  const [value, setValue] = useState("100");
  const [fromUnit, setFromUnit] = useState<UnitId>("mL");
  const [toUnit, setToUnit] = useState<UnitId>("g");
  const [ingredientIndex, setIngredientIndex] = useState(0);

  const showIngredient = needsDensity(fromUnit, toUnit);
  const density = INGREDIENT_DENSITIES[ingredientIndex]?.density;

  const numValue = Number.parseFloat(value);
  const result =
    !Number.isNaN(numValue) && numValue !== 0
      ? convert(
          numValue,
          fromUnit,
          toUnit,
          showIngredient ? density : undefined,
        )
      : null;

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <Card className="kraft-card">
      <CardHeader className="pb-2">
        <CardTitle className="kraft-title text-base">Convertisseur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Value input */}
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valeur"
          min={0}
        />

        {/* Unit selectors with swap */}
        <div className="flex items-center gap-2">
          <Select
            value={fromUnit}
            onValueChange={(v) => setFromUnit(v as UnitId)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            aria-label="Inverser les unités"
          >
            <ArrowRightLeftIcon />
          </Button>

          <Select value={toUnit} onValueChange={(v) => setToUnit(v as UnitId)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ingredient selector (only for cross-dimension) */}
        {showIngredient && (
          <Select
            value={String(ingredientIndex)}
            onValueChange={(v) => setIngredientIndex(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {INGREDIENT_DENSITIES[ingredientIndex]?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {INGREDIENT_DENSITIES.map((ing, i) => (
                <SelectItem key={ing.name} value={String(i)}>
                  {ing.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Result */}
        <div className="rounded-md bg-muted/50 px-3 py-3 text-center">
          {result != null ? (
            <p className="font-semibold text-lg">
              {formatResult(result)}{" "}
              <span className="text-muted-foreground text-sm">
                {UNIT_MAP[toUnit].label}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              {value === "" || numValue === 0
                ? "Entrez une valeur"
                : "Sélectionnez un ingrédient"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

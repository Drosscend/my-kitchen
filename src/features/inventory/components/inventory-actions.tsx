"use client";

import { DownloadIcon, SearchIcon, UploadIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_OPTIONS,
  getCategoryLabel,
  getStateLabel,
  STATE_OPTIONS,
} from "../constants";
import type {
  Ingredient,
  IngredientCategory,
  IngredientState,
  InventoryFilters,
} from "../types";
import { exportToJSON, importFromJSON } from "../utils";
import { CopyButton } from "./copy-button";
import { IngredientForm } from "./ingredient-form";
import { StatsSummary } from "./stats-summary";

interface InventoryActionsProps {
  ingredients: Ingredient[];
  filters: InventoryFilters;
  onUpdateFilters: (updates: Partial<InventoryFilters>) => void;
  onResetFilters: () => void;
  onAdd: (data: {
    name: string;
    quantity: number;
    unit: "g" | "kg" | "mL" | "L" | "unit" | "piece";
    category: IngredientCategory;
    state: IngredientState;
  }) => void;
  onImport: (ingredients: Ingredient[]) => void;
}

export function InventoryActions({
  ingredients,
  filters,
  onUpdateFilters,
  onResetFilters,
  onAdd,
  onImport,
}: InventoryActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importFromJSON(file);
      onImport(imported);
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.state !== "all" ||
    filters.lowStockOnly ||
    filters.perishableOnly;

  return (
    <div className="space-y-4">
      <Card className="kraft-card">
        <CardHeader className="pb-2">
          <CardTitle className="kraft-title text-base">Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsSummary ingredients={ingredients} />
        </CardContent>
      </Card>

      <Card className="kraft-card">
        <CardHeader className="pb-2">
          <CardTitle className="kraft-title text-base">Ajouter</CardTitle>
        </CardHeader>
        <CardContent>
          <IngredientForm onAdd={onAdd} />
        </CardContent>
      </Card>

      <Card className="kraft-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="kraft-title flex items-center text-base">
              Filtres
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="xs" onClick={onResetFilters}>
                <XIcon className="size-3" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field>
            <FieldLabel htmlFor="search">Recherche</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <SearchIcon className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                id="search"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => onUpdateFilters({ search: e.target.value })}
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel>Catégorie</FieldLabel>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                onUpdateFilters({
                  category: value as IngredientCategory | "all",
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>{getCategoryLabel(filters.category)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>État</FieldLabel>
            <Select
              value={filters.state}
              onValueChange={(value) =>
                onUpdateFilters({
                  state: value as IngredientState | "all",
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>{getStateLabel(filters.state)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {STATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              checked={filters.lowStockOnly}
              onCheckedChange={(checked) =>
                onUpdateFilters({ lowStockOnly: checked === true })
              }
            />
            <FieldLabel className="cursor-pointer">
              Stock bas uniquement
            </FieldLabel>
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              checked={filters.perishableOnly}
              onCheckedChange={(checked) =>
                onUpdateFilters({ perishableOnly: checked === true })
              }
            />
            <FieldLabel className="cursor-pointer">
              Périssables uniquement
            </FieldLabel>
          </Field>
        </CardContent>
      </Card>

      <Card className="kraft-card">
        <CardHeader className="pb-2">
          <CardTitle className="kraft-title text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CopyButton ingredients={ingredients} />

          <Button
            variant="outline"
            onClick={() => exportToJSON(ingredients)}
            disabled={ingredients.length === 0}
            className="w-full justify-start gap-2"
          >
            <DownloadIcon />
            Exporter JSON
          </Button>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full justify-start gap-2"
          >
            <UploadIcon />
            Importer JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
}

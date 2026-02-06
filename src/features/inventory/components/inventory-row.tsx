"use client";

import {
  AppleIcon,
  BeefIcon,
  CarrotIcon,
  FishIcon,
  LeafIcon,
  MilkIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  SnowflakeIcon,
  Trash2Icon,
  WheatIcon,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
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
  CATEGORIES,
  CATEGORY_OPTIONS,
  STATE_OPTIONS,
  STATES,
  UNIT_OPTIONS,
  UNITS,
} from "../constants";
import type {
  Ingredient,
  IngredientCategory,
  IngredientState,
  IngredientUnit,
} from "../types";
import { isLowStock, isPerishable } from "../utils";

const CATEGORY_ICONS: Record<IngredientCategory, React.ElementType> = {
  vegetables: CarrotIcon,
  fruits: AppleIcon,
  meat: BeefIcon,
  fish: FishIcon,
  dairy: MilkIcon,
  spices: LeafIcon,
  starches: WheatIcon,
  other: PackageIcon,
};

interface InventoryRowProps {
  ingredient: Ingredient;
  onUpdate: (id: string, updates: Partial<Ingredient>) => void;
  onDelete: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export function InventoryRow({
  ingredient,
  onUpdate,
  onDelete,
  onIncrement,
  onDecrement,
}: InventoryRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(ingredient.name);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingState, setIsEditingState] = useState(false);

  const CategoryIcon = CATEGORY_ICONS[ingredient.category];
  const lowStock = isLowStock(ingredient);
  const perishable = isPerishable(ingredient);
  const unitLabel =
    ingredient.quantity > 1
      ? UNITS[ingredient.unit].labelPlural
      : UNITS[ingredient.unit].label;

  const handleNameBlur = () => {
    if (editedName.trim() && editedName !== ingredient.name) {
      onUpdate(ingredient.id, { name: editedName.trim() });
    } else {
      setEditedName(ingredient.name);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setEditedName(ingredient.name);
      setIsEditingName(false);
    }
  };

  return (
    <tr className="group border-border/50 border-b transition-colors hover:bg-paper-light/50">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <CategoryIcon className="size-4 shrink-0 text-muted-foreground" />
          {isEditingName ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="h-6 text-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="cursor-text text-left underline-offset-2 hover:underline"
            >
              {ingredient.name}
            </button>
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <InputGroup className="w-28">
          <InputGroupAddon align="inline-start">
            <InputGroupButton
              onClick={() => onDecrement(ingredient.id)}
              disabled={ingredient.quantity <= 0}
            >
              <MinusIcon className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput
            type="number"
            value={ingredient.quantity}
            onChange={(e) =>
              onUpdate(ingredient.id, {
                quantity: Math.max(0, Number(e.target.value)),
              })
            }
            className="text-center text-xs"
            min={0}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => onIncrement(ingredient.id)}>
              <PlusIcon className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </td>
      <td className="px-3 py-2">
        {isEditingUnit ? (
          <Select
            value={ingredient.unit}
            onValueChange={(value) => {
              if (value) {
                onUpdate(ingredient.id, { unit: value as IngredientUnit });
              }
              setIsEditingUnit(false);
            }}
            open={isEditingUnit}
            onOpenChange={(open) => setIsEditingUnit(open)}
          >
            <SelectTrigger
              size="sm"
              className="h-5 min-w-14 border-none bg-transparent px-1 text-muted-foreground text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {UNIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingUnit(true)}
            className="cursor-pointer text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            {unitLabel}
          </button>
        )}
      </td>
      <td className="px-3 py-2">
        {isEditingCategory ? (
          <Select
            value={ingredient.category}
            onValueChange={(value) => {
              if (value) {
                onUpdate(ingredient.id, {
                  category: value as IngredientCategory,
                });
              }
              setIsEditingCategory(false);
            }}
            open={isEditingCategory}
            onOpenChange={(open) => setIsEditingCategory(open)}
          >
            <SelectTrigger
              size="sm"
              className="h-5 border-none bg-transparent px-1 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingCategory(true)}
            className="cursor-pointer"
          >
            <Badge
              variant="secondary"
              className="text-xs hover:bg-secondary/80"
            >
              {CATEGORIES[ingredient.category].label}
            </Badge>
          </button>
        )}
      </td>
      <td className="px-3 py-2">
        {isEditingState ? (
          <Select
            value={ingredient.state}
            onValueChange={(value) => {
              if (value) {
                onUpdate(ingredient.id, {
                  state: value as IngredientState,
                });
              }
              setIsEditingState(false);
            }}
            open={isEditingState}
            onOpenChange={(open) => setIsEditingState(open)}
          >
            <SelectTrigger
              size="sm"
              className="h-5 border-none bg-transparent px-1 text-muted-foreground text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {STATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingState(true)}
            className="flex cursor-pointer items-center gap-1 underline-offset-2 hover:underline"
          >
            {ingredient.state === "frozen" && (
              <SnowflakeIcon className="size-3 text-accent" />
            )}
            <span className="text-muted-foreground text-xs">
              {STATES[ingredient.state].label}
            </span>
          </button>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {perishable && (
            <Badge variant="warning" className="text-xs">
              Périssable
            </Badge>
          )}
          {lowStock && (
            <Badge variant="destructive" className="text-xs">
              Stock bas
            </Badge>
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              />
            }
          >
            <Trash2Icon className="size-3" />
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cet ingrédient ?</AlertDialogTitle>
              <AlertDialogDescription>
                {ingredient.name} sera définitivement supprimé de votre
                inventaire.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => onDelete(ingredient.id)}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  );
}

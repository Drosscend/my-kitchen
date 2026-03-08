"use client";

import { PlusIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  getUnitLabel,
  STATE_OPTIONS,
  UNIT_OPTIONS,
} from "../constants";
import type {
  IngredientCategory,
  IngredientState,
  IngredientUnit,
} from "../types";

interface FormData {
  name: string;
  quantity: number;
  unit: IngredientUnit;
  category: IngredientCategory;
  state: IngredientState;
}

const DEFAULTS: FormData = {
  name: "",
  quantity: 100,
  unit: "g",
  category: "vegetables",
  state: "fresh",
};

interface IngredientFormProps {
  onAdd: (data: FormData) => void;
}

export function IngredientForm({ onAdd }: IngredientFormProps) {
  const [form, setForm] = useState<FormData>(DEFAULTS);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({ ...form, name: form.name.trim() });
    setForm(DEFAULTS);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field>
        <FieldLabel htmlFor="name">Nom</FieldLabel>
        <Input
          id="name"
          placeholder="Ex: Tomates cerises"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="quantity">Quantité</FieldLabel>
          <Input
            id="quantity"
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => set("quantity", Number(e.target.value))}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Unité</FieldLabel>
          <Select
            value={form.unit}
            onValueChange={(value) => set("unit", value as IngredientUnit)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{getUnitLabel(form.unit)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>Catégorie</FieldLabel>
        <Select
          value={form.category}
          onValueChange={(value) =>
            set("category", value as IngredientCategory)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>{getCategoryLabel(form.category)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
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
          value={form.state}
          onValueChange={(value) => set("state", value as IngredientState)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{getStateLabel(form.state)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Button type="submit" className="w-full">
        <PlusIcon />
        Ajouter
      </Button>
    </form>
  );
}

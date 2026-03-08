"use client";
"use no memo";

import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
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

interface IngredientFormProps {
  onAdd: (data: FormData) => void;
}

export function IngredientForm({ onAdd }: IngredientFormProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: "",
      quantity: 100,
      unit: "g",
      category: "vegetables",
      state: "fresh",
    },
  });

  const currentUnit = watch("unit");
  const currentCategory = watch("category");
  const currentState = watch("state");

  const onSubmit = (data: FormData) => {
    onAdd(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field>
        <FieldLabel htmlFor="name">Nom</FieldLabel>
        <Input
          id="name"
          placeholder="Ex: Tomates cerises"
          {...register("name", { required: true })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="quantity">Quantité</FieldLabel>
          <Input
            id="quantity"
            type="number"
            min={0}
            {...register("quantity", { required: true, valueAsNumber: true })}
          />
        </Field>

        <Field>
          <FieldLabel>Unité</FieldLabel>
          <Select
            value={currentUnit}
            onValueChange={(value) => setValue("unit", value as IngredientUnit)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{getUnitLabel(currentUnit)}</SelectValue>
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
          value={currentCategory}
          onValueChange={(value) =>
            setValue("category", value as IngredientCategory)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>{getCategoryLabel(currentCategory)}</SelectValue>
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
          value={currentState}
          onValueChange={(value) => setValue("state", value as IngredientState)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{getStateLabel(currentState)}</SelectValue>
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

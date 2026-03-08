"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  Ingredient,
  InventoryFilters,
  InventorySort,
  SortField,
} from "../types";
import { isLowStock, isPerishable } from "../utils";

const DEFAULT_FILTERS: InventoryFilters = {
  search: "",
  category: "all",
  state: "all",
  lowStockOnly: false,
  perishableOnly: false,
};

const DEFAULT_SORT: InventorySort = {
  field: "name",
  direction: "asc",
};

export function useInventoryFilter(ingredients: Ingredient[]) {
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<InventorySort>(DEFAULT_SORT);

  const filteredIngredients = useMemo(() => {
    let result = [...ingredients];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((ing) =>
        ing.name.toLowerCase().includes(searchLower),
      );
    }

    if (filters.category !== "all") {
      result = result.filter((ing) => ing.category === filters.category);
    }

    if (filters.state !== "all") {
      result = result.filter((ing) => ing.state === filters.state);
    }

    if (filters.lowStockOnly) {
      result = result.filter(isLowStock);
    }

    if (filters.perishableOnly) {
      result = result.filter(isPerishable);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name, "fr");
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category, "fr");
          break;
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sort.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [ingredients, filters, sort]);

  const updateFilters = useCallback((updates: Partial<InventoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSort = useCallback((field: SortField) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    sort,
    filteredIngredients,
    updateFilters,
    updateSort,
    resetFilters,
  };
}

export type UnitId = "g" | "kg" | "mL" | "cL" | "L" | "cac" | "cas";

type Dimension = "mass" | "volume";

interface UnitDef {
  id: UnitId;
  label: string;
  dimension: Dimension;
  /** Factor to convert to base unit (g for mass, mL for volume) */
  toBase: number;
}

export const UNITS: UnitDef[] = [
  { id: "g", label: "g", dimension: "mass", toBase: 1 },
  { id: "kg", label: "kg", dimension: "mass", toBase: 1000 },
  { id: "mL", label: "mL", dimension: "volume", toBase: 1 },
  { id: "cL", label: "cL", dimension: "volume", toBase: 10 },
  { id: "L", label: "L", dimension: "volume", toBase: 1000 },
  { id: "cac", label: "c.à.c", dimension: "volume", toBase: 5 },
  { id: "cas", label: "c.à.s", dimension: "volume", toBase: 15 },
];

export const UNIT_MAP = Object.fromEntries(
  UNITS.map((u) => [u.id, u]),
) as Record<UnitId, UnitDef>;

interface IngredientDensity {
  name: string;
  /** Density in g/mL */
  density: number;
}

export const INGREDIENT_DENSITIES: IngredientDensity[] = [
  { name: "Eau", density: 1.0 },
  { name: "Farine", density: 0.55 },
  { name: "Sucre", density: 0.85 },
  { name: "Sucre glace", density: 0.56 },
  { name: "Beurre fondu", density: 0.91 },
  { name: "Huile", density: 0.92 },
  { name: "Lait", density: 1.03 },
  { name: "Crème", density: 1.01 },
  { name: "Miel", density: 1.42 },
  { name: "Cacao en poudre", density: 0.52 },
  { name: "Sel fin", density: 1.22 },
  { name: "Riz (cru)", density: 0.85 },
  { name: "Flocons d'avoine", density: 0.35 },
];

/**
 * Convert a value from one unit to another.
 * Returns null if cross-dimension conversion without density.
 */
export function convert(
  value: number,
  from: UnitId,
  to: UnitId,
  density?: number,
): number | null {
  const fromUnit = UNIT_MAP[from];
  const toUnit = UNIT_MAP[to];

  if (fromUnit.dimension === toUnit.dimension) {
    // Same dimension: direct conversion via base unit
    return (value * fromUnit.toBase) / toUnit.toBase;
  }

  // Cross-dimension: need density
  if (density == null) return null;

  if (fromUnit.dimension === "volume" && toUnit.dimension === "mass") {
    // volume → mL → g (via density) → target mass unit
    const mL = value * fromUnit.toBase;
    const g = mL * density;
    return g / toUnit.toBase;
  }

  // mass → g → mL (via density) → target volume unit
  const g = value * fromUnit.toBase;
  const mL = g / density;
  return mL / toUnit.toBase;
}

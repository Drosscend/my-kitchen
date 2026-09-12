type Dimension = 'mass' | 'volume'

interface UnitDefinition {
  label: string
  dimension: Dimension
  toBase: number
}

export const CONVERSION_UNITS = {
  g: { label: 'g', dimension: 'mass', toBase: 1 },
  kg: { label: 'kg', dimension: 'mass', toBase: 1000 },
  mL: { label: 'mL', dimension: 'volume', toBase: 1 },
  cL: { label: 'cL', dimension: 'volume', toBase: 10 },
  L: { label: 'L', dimension: 'volume', toBase: 1000 },
  cac: { label: 'c.à.c', dimension: 'volume', toBase: 5 },
  cas: { label: 'c.à.s', dimension: 'volume', toBase: 15 },
} satisfies Record<string, UnitDefinition>

export type ConversionUnit = keyof typeof CONVERSION_UNITS

function unitKeys() {
  // SAFETY: The catalog is an object literal, so its runtime keys are exactly its key type.
  return Object.keys(CONVERSION_UNITS) as ConversionUnit[]
}

export const CONVERSION_UNIT_VALUES = unitKeys()

export const INGREDIENT_DENSITIES = [
  { name: 'Eau', density: 1.0 },
  { name: 'Farine', density: 0.55 },
  { name: 'Sucre', density: 0.85 },
  { name: 'Sucre glace', density: 0.56 },
  { name: 'Beurre fondu', density: 0.91 },
  { name: 'Huile', density: 0.92 },
  { name: 'Lait', density: 1.03 },
  { name: 'Crème', density: 1.01 },
  { name: 'Miel', density: 1.42 },
  { name: 'Cacao en poudre', density: 0.52 },
  { name: 'Sel fin', density: 1.22 },
  { name: 'Riz (cru)', density: 0.85 },
  { name: "Flocons d'avoine", density: 0.35 },
]

export function needsDensity(from: ConversionUnit, to: ConversionUnit) {
  return CONVERSION_UNITS[from].dimension !== CONVERSION_UNITS[to].dimension
}

/**
 * Null when crossing mass and volume without a density (g/mL).
 */
export function convert(value: number, from: ConversionUnit, to: ConversionUnit, density?: number) {
  const source = CONVERSION_UNITS[from]
  const target = CONVERSION_UNITS[to]

  if (source.dimension === target.dimension) {
    return (value * source.toBase) / target.toBase
  }

  if (density === undefined) {
    return null
  }

  const base = value * source.toBase
  const converted = source.dimension === 'volume' ? base * density : base / density
  return converted / target.toBase
}

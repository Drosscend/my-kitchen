import {
  AppleIcon,
  BeefIcon,
  CarrotIcon,
  FishIcon,
  LeafIcon,
  MilkIcon,
  PackageIcon,
  WheatIcon,
  type LucideIcon,
} from 'lucide-react'
import { type Data } from '@generated/data'
import { type Swatch } from '~/swatch'

export type Ingredient = Data.Inventory.Ingredient
export type Batch = Ingredient['batches'][number]

export type CatalogOption = { value: string; label: string }

export type Catalog = {
  categories: (CatalogOption & { defaultExpiryKind: string })[]
  units: CatalogOption[]
  states: CatalogOption[]
  expiryKinds: CatalogOption[]
}

export const CATEGORY_ICONS = {
  vegetables: CarrotIcon,
  fruits: AppleIcon,
  meat: BeefIcon,
  fish: FishIcon,
  dairy: MilkIcon,
  spices: LeafIcon,
  starches: WheatIcon,
  other: PackageIcon,
} satisfies Record<Ingredient['category'], LucideIcon>

export const CATEGORY_SWATCHES = {
  vegetables: 'sage',
  fruits: 'tomato',
  meat: 'tomato',
  fish: 'cornflower',
  dairy: 'cornflower',
  spices: 'cinnamon',
  starches: 'mustard',
  other: 'neutral',
} satisfies Record<Ingredient['category'], Swatch>

export function isCategory(value: string): value is Ingredient['category'] {
  return Object.hasOwn(CATEGORY_ICONS, value)
}

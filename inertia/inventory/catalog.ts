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

export type Ingredient = Data.Inventory.Ingredient

export type CatalogOption = { value: string; label: string }

export type Catalog = {
  categories: CatalogOption[]
  units: CatalogOption[]
  states: CatalogOption[]
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

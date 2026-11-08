import { PackageOpenIcon } from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty'
import { type Catalog, type Ingredient } from '~/inventory/catalog'
import { InventoryRow } from '~/inventory/inventory_row'

interface InventoryListProps {
  ingredients: Ingredient[]
  total: number
  catalog: Catalog
}

const COLUMNS = ['Nom', 'Quantité', 'Unité', 'Catégorie', 'État', 'Péremption']

export function InventoryList({ ingredients, total, catalog }: InventoryListProps) {
  if (ingredients.length === 0) {
    return (
      <Empty className="rounded-xl border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpenIcon />
          </EmptyMedia>
          <EmptyTitle>
            {total === 0
              ? 'Le garde-manger est vide'
              : 'Aucun ingrédient ne correspond aux filtres'}
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="mb-2.5 overflow-hidden rounded-xl bg-card paper-stack [--row-columns:minmax(0,1fr)_8.5rem_6rem_11rem_8rem_8rem_2.25rem]">
      <div
        aria-hidden
        className="hidden border-b-[1.5px] px-5 py-2.75 text-xs font-semibold text-muted-foreground lg:grid lg:grid-cols-(--row-columns) lg:items-center lg:gap-x-4"
      >
        {COLUMNS.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <ul className="divide-y divide-dashed">
        {ingredients.map((ingredient) => (
          <InventoryRow key={ingredient.id} ingredient={ingredient} catalog={catalog} />
        ))}
      </ul>
    </div>
  )
}

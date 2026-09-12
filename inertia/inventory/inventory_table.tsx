import { ArrowDownIcon, ArrowUpIcon, PackageIcon } from 'lucide-react'
import { type Catalog, type Ingredient } from '~/inventory/catalog'
import { InventoryRow } from '~/inventory/inventory_row'
import { type InventorySort, type SortField } from '~/inventory/use_inventory_filter'

interface InventoryTableProps {
  ingredients: Ingredient[]
  total: number
  catalog: Catalog
  sort: InventorySort
  onSort: (field: SortField) => void
}

const HEADER =
  'px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase'

function SortableHeader({
  field,
  sort,
  onSort,
  className,
  children,
}: {
  field: SortField
  sort: InventorySort
  onSort: (field: SortField) => void
  className?: string
  children: string
}) {
  const Icon = sort.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon

  return (
    <th className={`${HEADER} ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-1 transition-colors hover:text-primary"
      >
        {children}
        {sort.field === field && <Icon className="size-3" />}
      </button>
    </th>
  )
}

export function InventoryTable({ ingredients, total, catalog, sort, onSort }: InventoryTableProps) {
  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-muted-foreground">
        <PackageIcon className="size-12 opacity-50" />
        <p className="text-sm">
          {total === 0 ? 'Aucun ingrédient' : 'Aucun ingrédient ne correspond aux filtres'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <SortableHeader field="name" sort={sort} onSort={onSort} className="pl-5">
              Nom
            </SortableHeader>
            <SortableHeader field="quantity" sort={sort} onSort={onSort}>
              Quantité
            </SortableHeader>
            <th className={HEADER}>Unité</th>
            <SortableHeader field="category" sort={sort} onSort={onSort}>
              Catégorie
            </SortableHeader>
            <th className={HEADER}>État</th>
            <th className={HEADER}>Alerte</th>
            <th className="w-12 pr-5" />
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <InventoryRow key={ingredient.id} ingredient={ingredient} catalog={catalog} />
          ))}
        </tbody>
      </table>
      <p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
        {ingredients.length === total
          ? `${total} ingrédients`
          : `${ingredients.length} ingrédients sur ${total}`}
      </p>
    </div>
  )
}

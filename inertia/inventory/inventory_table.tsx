import { ArrowDownIcon, ArrowUpIcon, PackageIcon } from 'lucide-react'
import { type Catalog, type Ingredient } from '~/inventory/catalog'
import { InventoryRow } from '~/inventory/inventory_row'
import { type InventorySort, type SortField } from '~/inventory/use_inventory_filter'

interface InventoryTableProps {
  ingredients: Ingredient[]
  catalog: Catalog
  sort: InventorySort
  onSort: (field: SortField) => void
}

function SortableHeader({
  field,
  sort,
  onSort,
  children,
}: {
  field: SortField
  sort: InventorySort
  onSort: (field: SortField) => void
  children: string
}) {
  const Icon = sort.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon

  return (
    <th className="px-3 py-2 text-left">
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

export function InventoryTable({ ingredients, catalog, sort, onSort }: InventoryTableProps) {
  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <PackageIcon className="mb-4 size-12 opacity-50" />
        <p className="text-sm">Aucun ingrédient</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border">
            <SortableHeader field="name" sort={sort} onSort={onSort}>
              Nom
            </SortableHeader>
            <SortableHeader field="quantity" sort={sort} onSort={onSort}>
              Quantité
            </SortableHeader>
            <th className="px-3 py-2 text-left">Unité</th>
            <SortableHeader field="category" sort={sort} onSort={onSort}>
              Catégorie
            </SortableHeader>
            <th className="px-3 py-2 text-left">État</th>
            <th className="px-3 py-2 text-left">Alerte</th>
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <InventoryRow key={ingredient.id} ingredient={ingredient} catalog={catalog} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

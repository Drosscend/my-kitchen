import { Head } from '@inertiajs/react'
import { Card, CardContent } from '~/components/ui/card'
import { type Catalog, type Ingredient } from '~/inventory/catalog'
import { InventoryActions } from '~/inventory/inventory_actions'
import { InventoryTable } from '~/inventory/inventory_table'
import { useInventoryFilter } from '~/inventory/use_inventory_filter'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ ingredients: Ingredient[]; catalog: Catalog }>

export default function Inventory({ ingredients, catalog }: PageProps) {
  const { filters, sort, filtered, hasActiveFilters, updateFilters, toggleSort, resetFilters } =
    useInventoryFilter(ingredients)
  const actions = (
    <InventoryActions
      ingredients={ingredients}
      catalog={catalog}
      filters={filters}
      hasActiveFilters={hasActiveFilters}
      onUpdateFilters={updateFilters}
      onResetFilters={resetFilters}
    />
  )

  return (
    <>
      <Head title="Inventaire" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="lg:hidden">{actions}</div>

          <Card className="kraft-card order-2 lg:order-1">
            <CardContent className="pt-4">
              <InventoryTable
                ingredients={filtered}
                catalog={catalog}
                sort={sort}
                onSort={toggleSort}
              />
            </CardContent>
          </Card>

          <div className="order-1 hidden lg:order-2 lg:block">{actions}</div>
        </div>
      </main>
    </>
  )
}

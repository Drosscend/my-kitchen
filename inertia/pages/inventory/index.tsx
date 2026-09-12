import { Head } from '@inertiajs/react'
import { Page, PageHeader } from '~/components/page'
import { Card } from '~/components/ui/card'
import { type Catalog, type Ingredient } from '~/inventory/catalog'
import { CopyPantryButton } from '~/inventory/copy_pantry_button'
import { InventoryActions } from '~/inventory/inventory_actions'
import { InventoryTable } from '~/inventory/inventory_table'
import { StatsSummary } from '~/inventory/stats_summary'
import { useInventoryFilter } from '~/inventory/use_inventory_filter'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ ingredients: Ingredient[]; catalog: Catalog }>

export default function Inventory({ ingredients, catalog }: PageProps) {
  const { filters, sort, filtered, hasActiveFilters, updateFilters, toggleSort, resetFilters } =
    useInventoryFilter(ingredients)

  return (
    <>
      <Head title="Inventaire" />
      <Page>
        <PageHeader
          title="Inventaire"
          actions={<CopyPantryButton disabled={ingredients.length === 0} />}
        />

        <StatsSummary ingredients={ingredients} />

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
          <Card className="kraft-card order-2 min-w-0 py-0 xl:order-1">
            <InventoryTable
              ingredients={filtered}
              total={ingredients.length}
              catalog={catalog}
              sort={sort}
              onSort={toggleSort}
            />
          </Card>

          <aside className="order-1 space-y-6 xl:sticky xl:top-8 xl:order-2 xl:self-start">
            <InventoryActions
              catalog={catalog}
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
            />
          </aside>
        </div>
      </Page>
    </>
  )
}

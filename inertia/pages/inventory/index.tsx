import { Head } from '@inertiajs/react'
import { Page, PageHeader } from '~/components/page'
import { AddIngredientDialog } from '~/inventory/add_ingredient_dialog'
import { type Catalog, type Ingredient } from '~/inventory/catalog'
import { CopyPantryButton } from '~/inventory/copy_pantry_button'
import { InventoryList } from '~/inventory/inventory_list'
import { InventoryToolbar } from '~/inventory/inventory_toolbar'
import { UrgentShelf } from '~/inventory/urgent_shelf'
import { useInventoryFilter } from '~/inventory/use_inventory_filter'
import { plural } from '~/plural'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ ingredients: Ingredient[]; catalog: Catalog }>

export default function Inventory({ ingredients, catalog }: PageProps) {
  const { filters, sort, filtered, hasActiveFilters, updateFilters, setSort, resetFilters } =
    useInventoryFilter(ingredients)

  return (
    <>
      <Head title="Inventaire" />
      <Page>
        <PageHeader
          title="Inventaire"
          meta={
            filtered.length === ingredients.length
              ? plural(ingredients.length, 'ingrédient')
              : `${filtered.length} sur ${ingredients.length}`
          }
          actions={
            <>
              <CopyPantryButton disabled={ingredients.length === 0} />
              <AddIngredientDialog catalog={catalog} />
            </>
          }
        />

        <UrgentShelf ingredients={ingredients} />

        <div className="flex flex-col gap-4">
          <InventoryToolbar
            ingredients={ingredients}
            catalog={catalog}
            filters={filters}
            sort={sort}
            hasActiveFilters={hasActiveFilters}
            onUpdateFilters={updateFilters}
            onSort={setSort}
            onResetFilters={resetFilters}
          />
          <InventoryList ingredients={filtered} total={ingredients.length} catalog={catalog} />
        </div>
      </Page>
    </>
  )
}

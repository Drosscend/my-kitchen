import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { DialogSheet } from '~/components/dialog_sheet'
import { Button } from '~/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { type Catalog, type CatalogOption, type Ingredient } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { isExpiringSoon } from '~/inventory/expiry'
import { categoryIcon, stateIcon } from '~/inventory/option_icons'
import { type InventoryFilters, type SortField } from '~/inventory/use_inventory_filter'

type Flag = 'expiringOnly' | 'perishableOnly' | 'lowStockOnly'

const SORT_OPTIONS: (CatalogOption & { value: SortField })[] = [
  { value: 'name', label: 'Par nom' },
  { value: 'expiry', label: 'Par péremption' },
  { value: 'quantity', label: 'Par quantité' },
  { value: 'category', label: 'Par catégorie' },
  { value: 'updatedAt', label: 'Récents' },
]

interface InventoryToolbarProps {
  ingredients: Ingredient[]
  catalog: Catalog
  filters: InventoryFilters
  sort: SortField
  hasActiveFilters: boolean
  onUpdateFilters: (changes: Partial<InventoryFilters>) => void
  onSort: (sort: SortField) => void
  onResetFilters: () => void
}

export function InventoryToolbar({
  ingredients,
  catalog,
  filters,
  sort,
  hasActiveFilters,
  onUpdateFilters,
  onSort,
  onResetFilters,
}: InventoryToolbarProps) {
  const flags: { value: Flag; label: string; count: number }[] = [
    {
      value: 'expiringOnly',
      label: 'À consommer vite',
      count: ingredients.filter((ingredient) => isExpiringSoon(ingredient.expiryStatus)).length,
    },
    {
      value: 'perishableOnly',
      label: 'Périssables',
      count: ingredients.filter((ingredient) => ingredient.perishable).length,
    },
    {
      value: 'lowStockOnly',
      label: 'Stock bas',
      count: ingredients.filter((ingredient) => ingredient.lowStock).length,
    },
  ]

  const selects = (
    <>
      <CatalogSelect
        options={catalog.categories}
        value={filters.category}
        icon={categoryIcon}
        allLabel="Toutes catégories"
        ariaLabel="Catégorie"
        triggerClassName="w-full bg-card"
        onValueChange={(category) => onUpdateFilters({ category })}
      />
      <CatalogSelect
        options={catalog.states}
        value={filters.state}
        icon={stateIcon}
        allLabel="Tous états"
        ariaLabel="État"
        triggerClassName="w-full bg-card"
        onValueChange={(state) => onUpdateFilters({ state })}
      />
      <CatalogSelect
        options={SORT_OPTIONS}
        value={sort}
        ariaLabel="Tri"
        triggerClassName="w-full bg-card"
        onValueChange={(value) => {
          const option = SORT_OPTIONS.find((candidate) => candidate.value === value)

          if (option) {
            onSort(option.value)
          }
        }}
      />
    </>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-[minmax(0,1fr)_12rem_9rem_10rem]">
        <InputGroup className="flex-1 bg-card sm:col-span-full lg:col-span-1">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Rechercher un ingrédient"
            placeholder="Rechercher un ingrédient"
            value={filters.search}
            onChange={(event) => onUpdateFilters({ search: event.target.value })}
          />
        </InputGroup>
        <div className="hidden sm:contents">{selects}</div>
        <Dialog>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="Filtres et tri"
                className="bg-card sm:hidden"
              >
                <SlidersHorizontalIcon />
              </Button>
            }
          />
          <DialogSheet>
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Filtres et tri</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">{selects}</div>
          </DialogSheet>
        </Dialog>
      </div>

      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ToggleGroup
          multiple
          variant="outline"
          aria-label="Filtres rapides"
          value={flags.filter((flag) => filters[flag.value]).map((flag) => flag.value)}
          onValueChange={(pressed) =>
            onUpdateFilters(
              Object.fromEntries(flags.map((flag) => [flag.value, pressed.includes(flag.value)]))
            )
          }
        >
          {flags.map((flag) => (
            <ToggleGroupItem
              key={flag.value}
              value={flag.value}
              className="rounded-full bg-card pr-1.5 pl-3.5 font-semibold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90 aria-pressed:hover:text-primary-foreground"
            >
              {flag.label}
              <span className="inline-grid h-5.5 min-w-5.5 place-items-center rounded-full bg-muted px-1.5 text-xs font-bold text-muted-foreground tabular-nums in-aria-pressed:bg-primary-foreground/20 in-aria-pressed:text-primary-foreground">
                {flag.count}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onResetFilters} className="shrink-0">
            <XIcon data-icon="inline-start" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}

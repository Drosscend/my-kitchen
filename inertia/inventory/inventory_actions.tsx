import { SearchIcon, XIcon } from 'lucide-react'
import { SectionCard } from '~/components/section_card'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Field, FieldLabel } from '~/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { type Catalog } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { IngredientForm } from '~/inventory/ingredient_form'
import { type InventoryFilters } from '~/inventory/use_inventory_filter'

interface InventoryActionsProps {
  catalog: Catalog
  filters: InventoryFilters
  hasActiveFilters: boolean
  onUpdateFilters: (changes: Partial<InventoryFilters>) => void
  onResetFilters: () => void
}

export function InventoryActions({
  catalog,
  filters,
  hasActiveFilters,
  onUpdateFilters,
  onResetFilters,
}: InventoryActionsProps) {
  return (
    <>
      <SectionCard title="Ajouter">
        <IngredientForm catalog={catalog} />
      </SectionCard>

      <SectionCard
        title="Filtres"
        action={
          hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onResetFilters}>
              <XIcon data-icon="inline-start" />
              Réinitialiser
            </Button>
          )
        }
      >
        <Field>
          <FieldLabel htmlFor="search">Recherche</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <SearchIcon className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              id="search"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(event) => onUpdateFilters({ search: event.target.value })}
            />
          </InputGroup>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Catégorie</FieldLabel>
            <CatalogSelect
              options={catalog.categories}
              value={filters.category}
              allLabel="Toutes"
              onValueChange={(category) => onUpdateFilters({ category })}
            />
          </Field>

          <Field>
            <FieldLabel>État</FieldLabel>
            <CatalogSelect
              options={catalog.states}
              value={filters.state}
              allLabel="Tous"
              onValueChange={(state) => onUpdateFilters({ state })}
            />
          </Field>
        </div>

        <Field orientation="horizontal">
          <Checkbox
            id="filter-low-stock"
            checked={filters.lowStockOnly}
            onCheckedChange={(checked) => onUpdateFilters({ lowStockOnly: checked === true })}
          />
          <FieldLabel htmlFor="filter-low-stock" className="cursor-pointer">
            Stock bas uniquement
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="filter-perishable"
            checked={filters.perishableOnly}
            onCheckedChange={(checked) => onUpdateFilters({ perishableOnly: checked === true })}
          />
          <FieldLabel htmlFor="filter-perishable" className="cursor-pointer">
            Périssables uniquement
          </FieldLabel>
        </Field>
      </SectionCard>
    </>
  )
}

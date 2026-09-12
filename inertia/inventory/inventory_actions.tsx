import { SearchIcon, XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Field, FieldLabel } from '~/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { type Catalog, type Ingredient } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { CopyButton } from '~/inventory/copy_button'
import { IngredientForm } from '~/inventory/ingredient_form'
import { StatsSummary } from '~/inventory/stats_summary'
import { type InventoryFilters } from '~/inventory/use_inventory_filter'

interface InventoryActionsProps {
  ingredients: Ingredient[]
  catalog: Catalog
  filters: InventoryFilters
  hasActiveFilters: boolean
  onUpdateFilters: (changes: Partial<InventoryFilters>) => void
  onResetFilters: () => void
}

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="kraft-card">
      <CardHeader className="pb-2">
        <CardTitle className="kraft-title text-base">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  )
}

export function InventoryActions({
  ingredients,
  catalog,
  filters,
  hasActiveFilters,
  onUpdateFilters,
  onResetFilters,
}: InventoryActionsProps) {
  return (
    <div className="space-y-4">
      <Section title="Résumé">
        <StatsSummary ingredients={ingredients} />
      </Section>

      <Section title="Ajouter">
        <IngredientForm catalog={catalog} />
      </Section>

      <Section
        title="Filtres"
        action={
          hasActiveFilters && (
            <Button variant="ghost" size="xs" onClick={onResetFilters} className="justify-self-end">
              <XIcon className="size-3" />
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
      </Section>

      <Section title="Actions">
        <CopyButton disabled={ingredients.length === 0} />
      </Section>
    </div>
  )
}

import { MinusIcon, PlusIcon, SlidersHorizontalIcon, SnowflakeIcon } from 'lucide-react'
import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '~/components/ui/input-group'
import { type Catalog, type CatalogOption, type Ingredient } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { CategoryMark } from '~/inventory/category_mark'
import { ExpiryStamp } from '~/inventory/expiry_stamp'
import { IngredientDialog } from '~/inventory/ingredient_dialog'
import { categoryIcon, stateIcon } from '~/inventory/option_icons'
import { useIngredientActions } from '~/inventory/use_ingredient_actions'
import { plural } from '~/plural'

interface InventoryRowProps {
  ingredient: Ingredient
  catalog: Catalog
}

type EditableField = 'name' | 'quantity' | 'unit' | 'category' | 'state' | null

export function InventoryRow({ ingredient, catalog }: InventoryRowProps) {
  const { update, updateField, adjust } = useIngredientActions(ingredient)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EditableField>(null)
  const [draftName, setDraftName] = useState(ingredient.name)
  const [draftQuantity, setDraftQuantity] = useState(String(ingredient.quantity))
  const frozen = ingredient.state === 'frozen'

  function startEditing(field: EditableField) {
    setDraftName(ingredient.name)
    setDraftQuantity(String(ingredient.quantity))
    setEditing(field)
  }

  function commitName() {
    const name = draftName.trim()

    if (name && name !== ingredient.name) {
      update({ name })
    }

    setEditing(null)
  }

  function commitQuantity() {
    const quantity = Number(draftQuantity)

    if (Number.isFinite(quantity) && quantity >= 0 && quantity !== ingredient.quantity) {
      update({ quantity })
    }

    setEditing(null)
  }

  function onKeyDown(event: KeyboardEvent, commit: () => void, cancel: () => void) {
    if (event.key === 'Enter') {
      commit()
    } else if (event.key === 'Escape') {
      cancel()
    }
  }

  function selectCell(
    field: 'unit' | 'category' | 'state',
    options: CatalogOption[],
    editLabel: string,
    label: ReactNode,
    icon?: (value: string) => ReactNode
  ) {
    if (editing !== field) {
      return (
        <button
          type="button"
          onClick={() => startEditing(field)}
          aria-label={editLabel}
          className="flex h-9 cursor-pointer items-center gap-1.5 truncate text-left text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {label}
        </button>
      )
    }

    return (
      <CatalogSelect
        options={options}
        value={ingredient[field]}
        ariaLabel={editLabel}
        icon={icon}
        open
        onOpenChange={(open) => !open && setEditing(null)}
        onValueChange={(value) => {
          updateField(field, value)
          setEditing(null)
        }}
      />
    )
  }

  const expiry = (
    <>
      <ExpiryStamp {...ingredient} />
      {ingredient.batches.length > 1 && (
        <span className="text-xs text-muted-foreground">
          {plural(ingredient.batches.length, 'lot')}
        </span>
      )}
    </>
  )

  const lowStock = ingredient.lowStock && (
    <span className="highlight shrink-0 px-0.75 text-[13px] font-bold text-destructive [--highlight-color:var(--color-tomato)]">
      Stock bas
    </span>
  )

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-3.5 py-2.75 transition-colors hover:bg-muted/60 lg:grid-cols-(--row-columns) lg:gap-x-4 lg:px-5 lg:py-1.75">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex w-full min-w-0 items-center gap-2.5 text-left lg:hidden"
        >
          <CategoryMark category={ingredient.category} size="sm" />
          <span className="flex min-w-0 flex-col items-start gap-1.5">
            <span className="flex max-w-full items-center gap-2">
              <span className="truncate text-[15.5px] font-semibold">{ingredient.name}</span>
              {lowStock}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {expiry}
              <span className="truncate">{ingredient.categoryLabel}</span>
              {frozen && <SnowflakeIcon className="size-3.5 text-primary" aria-label="Congelé" />}
            </span>
          </span>
        </button>

        <div className="hidden min-w-0 items-center gap-2.5 lg:flex">
          <CategoryMark category={ingredient.category} size="sm" />
          {editing === 'name' ? (
            <Input
              ref={(input) => input?.focus()}
              value={draftName}
              aria-label="Nom"
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => onKeyDown(event, commitName, () => setEditing(null))}
            />
          ) : (
            <button
              type="button"
              onClick={() => startEditing('name')}
              aria-label={`Modifier le nom : ${ingredient.name}`}
              className="h-9 cursor-text truncate text-left text-[15px] font-semibold underline-offset-4 hover:underline"
            >
              {ingredient.name}
            </button>
          )}
          {lowStock}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <InputGroup className="h-9 w-30 rounded-full bg-card">
          <InputGroupAddon align="inline-start">
            <InputGroupButton
              size="icon-sm"
              className="rounded-full text-muted-foreground"
              aria-label="Retirer une unité"
              onClick={() => adjust(-1)}
              disabled={ingredient.quantity <= 0}
            >
              <MinusIcon />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput
            type="number"
            min={0}
            step="any"
            aria-label={`Quantité, en ${ingredient.unitLabel}`}
            value={editing === 'quantity' ? draftQuantity : String(ingredient.quantity)}
            onFocus={() => startEditing('quantity')}
            onChange={(event) => setDraftQuantity(event.target.value)}
            onBlur={commitQuantity}
            onKeyDown={(event) =>
              onKeyDown(event, commitQuantity, () => setDraftQuantity(String(ingredient.quantity)))
            }
            className="text-center font-semibold tabular-nums"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-sm"
              className="rounded-full bg-muted"
              aria-label="Ajouter une unité"
              onClick={() => adjust(1)}
            >
              <PlusIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <span className="w-6 text-xs text-muted-foreground lg:hidden">{ingredient.unitLabel}</span>
      </div>

      <div className="hidden lg:block">
        {selectCell(
          'unit',
          catalog.units,
          `Modifier l'unité : ${ingredient.unitLabel}`,
          ingredient.unitLabel
        )}
      </div>
      <div className="hidden min-w-0 lg:block">
        {selectCell(
          'category',
          catalog.categories,
          `Modifier la catégorie : ${ingredient.categoryLabel}`,
          ingredient.categoryLabel,
          categoryIcon
        )}
      </div>
      <div className="hidden min-w-0 lg:block">
        {selectCell(
          'state',
          catalog.states,
          `Modifier l'état : ${ingredient.stateLabel}`,
          <>
            {frozen && <SnowflakeIcon className="size-3.5 text-primary" />}
            {ingredient.stateLabel}
          </>,
          stateIcon
        )}
      </div>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label={`Gérer les lots : ${ingredient.name}`}
        className="hidden h-9 cursor-pointer items-center gap-2 lg:flex"
      >
        {expiry}
      </button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Modifier ${ingredient.name}`}
        onClick={() => setDialogOpen(true)}
        className="hidden lg:inline-flex"
      >
        <SlidersHorizontalIcon className="text-muted-foreground" />
      </Button>

      <IngredientDialog
        ingredient={ingredient}
        catalog={catalog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </li>
  )
}

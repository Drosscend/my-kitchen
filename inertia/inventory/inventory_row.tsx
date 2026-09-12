import { useRouter } from '@adonisjs/inertia/react'
import { MinusIcon, PlusIcon, SnowflakeIcon, Trash2Icon } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '~/components/ui/input-group'
import { CATEGORY_ICONS, type Catalog, type Ingredient } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'

const VISIT_OPTIONS = { preserveScroll: true, preserveState: true } as const

interface InventoryRowProps {
  ingredient: Ingredient
  catalog: Catalog
}

type EditableField = 'name' | 'quantity' | 'unit' | 'category' | 'state' | null

const INLINE_TRIGGER = 'h-5 min-w-14 border-none bg-transparent px-1 text-xs text-muted-foreground'

export function InventoryRow({ ingredient, catalog }: InventoryRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState<EditableField>(null)
  const [draftName, setDraftName] = useState(ingredient.name)
  const [draftQuantity, setDraftQuantity] = useState(String(ingredient.quantity))
  const CategoryIcon = CATEGORY_ICONS[ingredient.category]

  function update(
    changes: Partial<Pick<Ingredient, 'name' | 'quantity' | 'unit' | 'category' | 'state'>>
  ) {
    router.visit(
      { route: 'inventory.update', routeParams: { id: ingredient.id } },
      { ...VISIT_OPTIONS, data: changes }
    )
  }

  function adjust(delta: number) {
    router.visit(
      { route: 'inventory.adjust', routeParams: { id: ingredient.id } },
      { ...VISIT_OPTIONS, data: { delta } }
    )
  }

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

  function onKeyDown(event: KeyboardEvent, commit: () => void) {
    if (event.key === 'Enter') {
      commit()
    } else if (event.key === 'Escape') {
      setEditing(null)
    }
  }

  function selectCell(
    field: 'unit' | 'category' | 'state',
    options: Catalog[keyof Catalog],
    label: React.ReactNode
  ) {
    if (editing !== field) {
      return (
        <button
          type="button"
          onClick={() => startEditing(field)}
          className="flex cursor-pointer items-center gap-1 text-xs underline-offset-2 hover:underline"
        >
          {label}
        </button>
      )
    }

    return (
      <CatalogSelect
        options={options}
        value={ingredient[field]}
        open
        onOpenChange={(open) => !open && setEditing(null)}
        triggerClassName={INLINE_TRIGGER}
        onValueChange={(value) => {
          if (value !== ingredient[field]) {
            update({ [field]: value })
          }
          setEditing(null)
        }}
      />
    )
  }

  return (
    <tr className="group border-b border-border/50 transition-colors hover:bg-paper-light/50">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <CategoryIcon className="size-4 shrink-0 text-muted-foreground" />
          {editing === 'name' ? (
            <Input
              ref={(input) => input?.focus()}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => onKeyDown(event, commitName)}
              className="h-6 text-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => startEditing('name')}
              className="cursor-text text-left underline-offset-2 hover:underline"
            >
              {ingredient.name}
            </button>
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <InputGroup className="w-28">
          <InputGroupAddon align="inline-start">
            <InputGroupButton
              aria-label="Retirer une unité"
              onClick={() => adjust(-1)}
              disabled={ingredient.quantity <= 0}
            >
              <MinusIcon className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput
            type="number"
            min={0}
            step="any"
            aria-label="Quantité"
            value={editing === 'quantity' ? draftQuantity : String(ingredient.quantity)}
            onFocus={() => startEditing('quantity')}
            onChange={(event) => setDraftQuantity(event.target.value)}
            onBlur={commitQuantity}
            onKeyDown={(event) => onKeyDown(event, commitQuantity)}
            className="text-center text-xs"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton aria-label="Ajouter une unité" onClick={() => adjust(1)}>
              <PlusIcon className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </td>
      <td className="px-3 py-2">
        {selectCell(
          'unit',
          catalog.units,
          <span className="text-muted-foreground">{ingredient.unitLabel}</span>
        )}
      </td>
      <td className="px-3 py-2">
        {selectCell(
          'category',
          catalog.categories,
          <Badge variant="secondary" className="text-xs hover:bg-secondary/80">
            {ingredient.categoryLabel}
          </Badge>
        )}
      </td>
      <td className="px-3 py-2">
        {selectCell(
          'state',
          catalog.states,
          <>
            {ingredient.state === 'frozen' && <SnowflakeIcon className="size-3 text-accent" />}
            <span className="text-muted-foreground">{ingredient.stateLabel}</span>
          </>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {ingredient.perishable && (
            <Badge variant="warning" className="text-xs">
              Périssable
            </Badge>
          )}
          {ingredient.lowStock && (
            <Badge variant="destructive" className="text-xs">
              Stock bas
            </Badge>
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Supprimer ${ingredient.name}`}
                className="text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
              />
            }
          >
            <Trash2Icon className="size-3" />
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cet ingrédient ?</AlertDialogTitle>
              <AlertDialogDescription>
                {ingredient.name} disparaît définitivement du garde-manger.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() =>
                  router.visit(
                    { route: 'inventory.destroy', routeParams: { id: ingredient.id } },
                    VISIT_OPTIONS
                  )
                }
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  )
}

import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { DialogSheet } from '~/components/dialog_sheet'
import { Button } from '~/components/ui/button'
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Field, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { formatAmount } from '~/recipes/format'
import { parseIngredient, UNIT_SUGGESTIONS } from '~/recipes/recipe_document'
import { type RecipeIngredient } from '~/recipes/types'

interface IngredientEditorProps {
  ingredients: RecipeIngredient[]
  baseServings: number
  onServingsChange: (servings: number) => void
  onAdd: (ingredient: RecipeIngredient) => void
  onUpdate: (ref: string, changes: Partial<RecipeIngredient>) => void
  onMove: (ref: string, offset: number) => void
  onRemove: (ingredient: RecipeIngredient) => void
}

function ServingsStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span id="servings-label" className="text-sm text-muted-foreground">
        Portions
      </span>
      <div
        role="group"
        aria-labelledby="servings-label"
        className="flex items-center rounded-full border bg-background"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          aria-label="Une portion de moins"
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
        >
          <MinusIcon />
        </Button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">{value}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          aria-label="Une portion de plus"
          disabled={value >= 100}
          onClick={() => onChange(value + 1)}
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  )
}

function QuickAdd({
  taken,
  onAdd,
}: {
  taken: string[]
  onAdd: (ingredient: RecipeIngredient) => void
}) {
  const [text, setText] = useState('')
  const parsed = parseIngredient(text, taken)

  function add() {
    if (parsed) {
      onAdd(parsed)
      setText('')
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        aria-label="Ajouter un ingrédient"
        placeholder="200 g farine"
        enterKeyHint="done"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            add()
          }
        }}
        className="flex-1 bg-background"
      />
      <Button disabled={!parsed} onClick={add}>
        <PlusIcon data-icon="inline-start" />
        Ajouter
      </Button>
    </div>
  )
}

interface IngredientDialogProps {
  ingredient: RecipeIngredient
  first: boolean
  last: boolean
  onUpdate: (changes: Partial<RecipeIngredient>) => void
  onMove: (offset: number) => void
  onRemove: () => void
  onClose: () => void
}

function IngredientDialog({
  ingredient,
  first,
  last,
  onUpdate,
  onMove,
  onRemove,
  onClose,
}: IngredientDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogSheet className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{ingredient.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Field className="col-span-2">
            <FieldLabel htmlFor="ingredient-name">Nom</FieldLabel>
            <Input
              id="ingredient-name"
              defaultValue={ingredient.name}
              onChange={(event) => {
                const name = event.target.value.trim()

                if (name) {
                  onUpdate({ name })
                }
              }}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-amount">Quantité</FieldLabel>
            <Input
              id="ingredient-amount"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              defaultValue={ingredient.amount ?? ''}
              onChange={(event) => {
                const amount = event.target.value === '' ? null : Number(event.target.value)

                if (amount === null || (Number.isFinite(amount) && amount >= 0)) {
                  onUpdate({ amount })
                }
              }}
              className="tabular-nums"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-unit">Unité</FieldLabel>
            <Input
              id="ingredient-unit"
              list="unit-suggestions"
              maxLength={50}
              defaultValue={ingredient.unit ?? ''}
              onChange={(event) => onUpdate({ unit: event.target.value.trim() || null })}
            />
            <datalist id="unit-suggestions">
              {UNIT_SUGGESTIONS.map((unit) => (
                <option key={unit} value={unit} />
              ))}
            </datalist>
          </Field>
          <Button variant="outline" disabled={first} onClick={() => onMove(-1)}>
            <ChevronUpIcon data-icon="inline-start" />
            Monter
          </Button>
          <Button variant="outline" disabled={last} onClick={() => onMove(1)}>
            <ChevronDownIcon data-icon="inline-start" />
            Descendre
          </Button>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={onRemove}>
            <Trash2Icon data-icon="inline-start" />
            Retirer l’ingrédient
          </Button>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogSheet>
    </Dialog>
  )
}

export function IngredientEditor({
  ingredients,
  baseServings,
  onServingsChange,
  onAdd,
  onUpdate,
  onMove,
  onRemove,
}: IngredientEditorProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const editedIndex = ingredients.findIndex((ingredient) => ingredient.ref === editing)
  const edited = editedIndex === -1 ? null : ingredients[editedIndex]

  return (
    <section className="mb-2.5 rounded-xl bg-card px-5 pt-5 pb-5 paper-stack">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-xl">Ingrédients</h2>
        <ServingsStepper value={baseServings} onChange={onServingsChange} />
      </div>
      {ingredients.length > 0 && (
        <ul className="mb-3 divide-y divide-ruling">
          {ingredients.map((ingredient) => (
            <li key={ingredient.ref}>
              <button
                type="button"
                onClick={() => setEditing(ingredient.ref)}
                className="-mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-baseline justify-between gap-4 rounded-md px-2 py-2.5 text-left hover:bg-muted"
              >
                <span>{ingredient.name}</span>
                {ingredient.amount !== null && (
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatAmount(ingredient.amount)} {ingredient.unit}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <QuickAdd taken={ingredients.map((ingredient) => ingredient.ref)} onAdd={onAdd} />
      {edited && (
        <IngredientDialog
          key={edited.ref}
          ingredient={edited}
          first={editedIndex === 0}
          last={editedIndex === ingredients.length - 1}
          onUpdate={(changes) => onUpdate(edited.ref, changes)}
          onMove={(offset) => onMove(edited.ref, offset)}
          onRemove={() => {
            setEditing(null)
            onRemove(edited)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}

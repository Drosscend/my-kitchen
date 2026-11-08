import { Form, useRouter } from '@adonisjs/inertia/react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { ConfirmDeleteDialog } from '~/components/confirm_delete_dialog'
import { DialogSheet } from '~/components/dialog_sheet'
import { Button } from '~/components/ui/button'
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Field, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type Batch, type Catalog, type Ingredient } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { ExpiryStamp } from '~/inventory/expiry_stamp'
import { categoryIcon, stateIcon } from '~/inventory/option_icons'
import { useIngredientActions, VISIT_OPTIONS } from '~/inventory/use_ingredient_actions'

function commitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.currentTarget.blur()
  }
}

function BatchRow({
  ingredient,
  batch,
  catalog,
}: {
  ingredient: Ingredient
  batch: Batch
  catalog: Catalog
}) {
  const router = useRouter()
  const routeParams = { id: ingredient.id, batchId: batch.id }

  function update(changes: { quantity?: number; expiresOn?: string | null; expiryKind?: string }) {
    router.visit(
      { route: 'inventory.batches.update', routeParams },
      { ...VISIT_OPTIONS, data: changes }
    )
  }

  return (
    <li className="flex flex-col gap-1.5">
      <div className="grid grid-cols-(--batch-columns) items-center gap-2">
        <Input
          type="number"
          min={0}
          step="any"
          aria-label={`Quantité du lot, en ${ingredient.unitLabel}`}
          defaultValue={batch.quantity}
          onKeyDown={commitOnEnter}
          onBlur={(event) => {
            const quantity = Number(event.target.value)

            if (Number.isFinite(quantity) && quantity > 0 && quantity !== batch.quantity) {
              update({ quantity })
            }
          }}
          className="tabular-nums"
        />
        <Input
          type="date"
          aria-label="Date de péremption"
          defaultValue={batch.expiresOn ?? ''}
          onKeyDown={commitOnEnter}
          onBlur={(event) => {
            const expiresOn = event.target.value || null

            if (expiresOn !== batch.expiresOn) {
              update({ expiresOn })
            }
          }}
        />
        {batch.expiryKind ? (
          <CatalogSelect
            options={catalog.expiryKinds}
            value={batch.expiryKind}
            onValueChange={(expiryKind) =>
              expiryKind !== batch.expiryKind && update({ expiryKind })
            }
          />
        ) : (
          <span />
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Supprimer le lot"
          onClick={() =>
            router.visit({ route: 'inventory.batches.destroy', routeParams }, VISIT_OPTIONS)
          }
        >
          <Trash2Icon className="text-muted-foreground" />
        </Button>
      </div>
      {batch.expiresOn && <ExpiryStamp {...batch} className="self-start" />}
    </li>
  )
}

function NewBatchForm({ ingredient, catalog }: { ingredient: Ingredient; catalog: Catalog }) {
  const defaultKind =
    catalog.categories.find((category) => category.value === ingredient.category)
      ?.defaultExpiryKind ?? 'use_by'
  const [expiryKind, setExpiryKind] = useState(defaultKind)

  return (
    <Form
      route="inventory.batches.store"
      routeParams={{ id: ingredient.id }}
      options={VISIT_OPTIONS}
      resetOnSuccess
      className="grid grid-cols-(--batch-columns) items-end gap-2"
    >
      {({ processing }) => (
        <>
          <Field>
            <FieldLabel htmlFor={`batch-quantity-${ingredient.id}`}>Quantité</FieldLabel>
            <Input
              id={`batch-quantity-${ingredient.id}`}
              name="quantity"
              type="number"
              min={0}
              step="any"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`batch-expires-on-${ingredient.id}`}>Péremption</FieldLabel>
            <Input id={`batch-expires-on-${ingredient.id}`} name="expiresOn" type="date" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`batch-kind-${ingredient.id}`}>Type</FieldLabel>
            <CatalogSelect
              id={`batch-kind-${ingredient.id}`}
              name="expiryKind"
              options={catalog.expiryKinds}
              value={expiryKind}
              onValueChange={setExpiryKind}
            />
          </Field>
          <Button type="submit" size="icon" aria-label="Ajouter le lot" disabled={processing}>
            <PlusIcon />
          </Button>
        </>
      )}
    </Form>
  )
}

interface IngredientDialogProps {
  ingredient: Ingredient
  catalog: Catalog
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Everything about one ingredient: its details, then its batches in
 * consumption order, each with its own expiry date.
 */
export function IngredientDialog({
  ingredient,
  catalog,
  open,
  onOpenChange,
}: IngredientDialogProps) {
  const { update, updateField, destroy } = useIngredientActions(ingredient)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSheet className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{ingredient.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Field className="col-span-2">
            <FieldLabel htmlFor={`name-${ingredient.id}`}>Nom</FieldLabel>
            <Input
              id={`name-${ingredient.id}`}
              key={ingredient.name}
              defaultValue={ingredient.name}
              onKeyDown={commitOnEnter}
              onBlur={(event) => {
                const name = event.target.value.trim()

                if (name && name !== ingredient.name) {
                  update({ name })
                }
              }}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`unit-${ingredient.id}`}>Unité</FieldLabel>
            <CatalogSelect
              id={`unit-${ingredient.id}`}
              options={catalog.units}
              value={ingredient.unit}
              onValueChange={(unit) => updateField('unit', unit)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`state-${ingredient.id}`}>État</FieldLabel>
            <CatalogSelect
              id={`state-${ingredient.id}`}
              options={catalog.states}
              value={ingredient.state}
              icon={stateIcon}
              onValueChange={(state) => updateField('state', state)}
            />
          </Field>
          <Field className="col-span-2">
            <FieldLabel htmlFor={`category-${ingredient.id}`}>Catégorie</FieldLabel>
            <CatalogSelect
              id={`category-${ingredient.id}`}
              options={catalog.categories}
              value={ingredient.category}
              icon={categoryIcon}
              onValueChange={(category) => updateField('category', category)}
            />
          </Field>
        </div>

        <section className="flex flex-col gap-4 border-t pt-5 [--batch-columns:4.5rem_minmax(0,1fr)_5rem_auto]">
          <h3 className="text-base">Lots</h3>
          {ingredient.batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun lot</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {ingredient.batches.map((batch) => (
                <BatchRow
                  key={`${batch.id}:${batch.quantity}:${batch.expiresOn}`}
                  ingredient={ingredient}
                  batch={batch}
                  catalog={catalog}
                />
              ))}
            </ul>
          )}
          <NewBatchForm ingredient={ingredient} catalog={catalog} />
        </section>

        <DialogFooter className="border-t pt-5 sm:justify-start">
          <ConfirmDeleteDialog
            title="Supprimer cet ingrédient ?"
            description={`${ingredient.name} disparaît définitivement du garde-manger.`}
            onConfirm={destroy}
            trigger={
              <Button variant="destructive">
                <Trash2Icon data-icon="inline-start" />
                Supprimer l'ingrédient
              </Button>
            }
          />
        </DialogFooter>
      </DialogSheet>
    </Dialog>
  )
}

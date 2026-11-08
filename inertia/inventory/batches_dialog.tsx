import { Form, useRouter } from '@adonisjs/inertia/react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState, type KeyboardEvent, type ReactElement } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Field, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type Batch, type Catalog, type Ingredient } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { expiryBadge } from '~/inventory/expiry'

const VISIT_OPTIONS = { preserveScroll: true, preserveState: true } as const

interface BatchesDialogProps {
  ingredient: Ingredient
  catalog: Catalog
  trigger: ReactElement
}

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
  const badge = expiryBadge(batch)

  function update(changes: { quantity?: number; expiresOn?: string | null; expiryKind?: string }) {
    router.visit(
      {
        route: 'inventory.batches.update',
        routeParams: { id: ingredient.id, batchId: batch.id },
      },
      { ...VISIT_OPTIONS, data: changes }
    )
  }

  return (
    <li className="grid grid-cols-[4rem_minmax(0,1fr)_4.5rem_auto] items-center gap-2">
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
        className="h-8 text-sm"
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
        className="h-8 text-sm"
      />
      {batch.expiryKind ? (
        <CatalogSelect
          options={catalog.expiryKinds}
          value={batch.expiryKind}
          triggerClassName="h-8 w-full text-sm"
          onValueChange={(expiryKind) => expiryKind !== batch.expiryKind && update({ expiryKind })}
        />
      ) : (
        <span />
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Supprimer le lot"
        onClick={() =>
          router.visit(
            {
              route: 'inventory.batches.destroy',
              routeParams: { id: ingredient.id, batchId: batch.id },
            },
            VISIT_OPTIONS
          )
        }
      >
        <Trash2Icon className="text-muted-foreground" />
      </Button>
      {badge?.variant && (
        <Badge variant={badge.variant} className="col-span-full -mt-1 text-xs">
          {badge.label}
        </Badge>
      )}
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
      className="grid grid-cols-[4rem_minmax(0,1fr)_4.5rem_auto] items-end gap-2 border-t border-border pt-4"
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
              className="h-8 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`batch-expires-on-${ingredient.id}`}>Péremption</FieldLabel>
            <Input
              id={`batch-expires-on-${ingredient.id}`}
              name="expiresOn"
              type="date"
              className="h-8 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`batch-kind-${ingredient.id}`}>Type</FieldLabel>
            <CatalogSelect
              id={`batch-kind-${ingredient.id}`}
              name="expiryKind"
              options={catalog.expiryKinds}
              value={expiryKind}
              onValueChange={setExpiryKind}
              triggerClassName="h-8 w-full text-sm"
            />
          </Field>
          <Button type="submit" size="icon-sm" aria-label="Ajouter le lot" disabled={processing}>
            <PlusIcon />
          </Button>
        </>
      )}
    </Form>
  )
}

/**
 * The batches of an ingredient, in consumption order, each with its own
 * expiry date.
 */
export function BatchesDialog({ ingredient, catalog, trigger }: BatchesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ingredient.name}</DialogTitle>
        </DialogHeader>
        {ingredient.batches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun lot</p>
        ) : (
          <ul className="space-y-3">
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
      </DialogContent>
    </Dialog>
  )
}

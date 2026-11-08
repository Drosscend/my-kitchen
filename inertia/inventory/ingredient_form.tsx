import { Form } from '@adonisjs/inertia/react'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type Catalog } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { categoryIcon, stateIcon } from '~/inventory/option_icons'

const DEFAULTS = { unit: 'g', category: 'vegetables', state: 'fresh' }

export function IngredientForm({ catalog }: { catalog: Catalog }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState(DEFAULTS.unit)
  const [category, setCategory] = useState(DEFAULTS.category)
  const [state, setState] = useState(DEFAULTS.state)
  const [expiryKind, setExpiryKind] = useState(defaultExpiryKind(DEFAULTS.category))

  function defaultExpiryKind(value: string) {
    return (
      catalog.categories.find((option) => option.value === value)?.defaultExpiryKind ?? 'use_by'
    )
  }

  function changeCategory(value: string) {
    setCategory(value)
    setExpiryKind(defaultExpiryKind(value))
  }

  return (
    <Form
      route="inventory.store"
      onSuccess={() => setName('')}
      resetOnSuccess={['expiresOn']}
      className="flex flex-col gap-4"
    >
      {({ errors, processing }) => (
        <>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="new-name">Nom</FieldLabel>
            <Input
              id="new-name"
              name="name"
              placeholder="Ex : Tomates cerises"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={Boolean(errors.quantity)}>
              <FieldLabel htmlFor="new-quantity">Quantité</FieldLabel>
              <Input
                id="new-quantity"
                name="quantity"
                type="number"
                min={0}
                step="any"
                defaultValue={100}
                required
                aria-invalid={Boolean(errors.quantity)}
              />
              {errors.quantity && <FieldError>{errors.quantity}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="new-unit">Unité</FieldLabel>
              <CatalogSelect
                id="new-unit"
                name="unit"
                options={catalog.units}
                value={unit}
                onValueChange={setUnit}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="new-category">Catégorie</FieldLabel>
            <CatalogSelect
              id="new-category"
              name="category"
              options={catalog.categories}
              value={category}
              icon={categoryIcon}
              onValueChange={changeCategory}
            />
          </Field>

          <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-4">
            <Field data-invalid={Boolean(errors.expiresOn)}>
              <FieldLabel htmlFor="new-expires-on">Péremption</FieldLabel>
              <Input
                id="new-expires-on"
                name="expiresOn"
                type="date"
                aria-invalid={Boolean(errors.expiresOn)}
              />
              {errors.expiresOn && <FieldError>{errors.expiresOn}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="new-expiry-kind">Type</FieldLabel>
              <CatalogSelect
                id="new-expiry-kind"
                name="expiryKind"
                options={catalog.expiryKinds}
                value={expiryKind}
                onValueChange={setExpiryKind}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="new-state">État</FieldLabel>
            <CatalogSelect
              id="new-state"
              name="state"
              options={catalog.states}
              value={state}
              icon={stateIcon}
              onValueChange={setState}
            />
          </Field>

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={processing}>
            <PlusIcon data-icon="inline-start" />
            Ajouter l'ingrédient
          </Button>
        </>
      )}
    </Form>
  )
}

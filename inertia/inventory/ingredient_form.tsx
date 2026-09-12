import { Form } from '@adonisjs/inertia/react'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type Catalog } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'

const DEFAULTS = { unit: 'g', category: 'vegetables', state: 'fresh' }

export function IngredientForm({ catalog }: { catalog: Catalog }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState(DEFAULTS.unit)
  const [category, setCategory] = useState(DEFAULTS.category)
  const [state, setState] = useState(DEFAULTS.state)

  return (
    <Form route="inventory.store" onSuccess={() => setName('')} className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
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
              onValueChange={setCategory}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="new-state">État</FieldLabel>
            <CatalogSelect
              id="new-state"
              name="state"
              options={catalog.states}
              value={state}
              onValueChange={setState}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={processing}>
            <PlusIcon data-icon="inline-start" />
            Ajouter
          </Button>
        </>
      )}
    </Form>
  )
}

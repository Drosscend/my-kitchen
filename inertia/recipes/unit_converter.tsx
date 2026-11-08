import { ArrowRightLeftIcon, ScaleIcon } from 'lucide-react'
import { useState } from 'react'
import { DialogSheet } from '~/components/dialog_sheet'
import { Button } from '~/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { CatalogSelect } from '~/inventory/catalog_select'
import {
  CONVERSION_UNIT_VALUES,
  CONVERSION_UNITS,
  convert,
  INGREDIENT_DENSITIES,
  needsDensity,
  type ConversionUnit,
} from '~/recipes/conversion'

function formatResult(value: number) {
  if (Number.isInteger(value)) {
    return String(value)
  }

  if (Math.abs(value) >= 100) {
    return value.toFixed(1)
  }

  return Math.abs(value) >= 1 ? value.toFixed(2) : value.toFixed(3)
}

const UNIT_OPTIONS = CONVERSION_UNIT_VALUES.map((unit) => ({
  value: unit,
  label: CONVERSION_UNITS[unit].label,
}))

const INGREDIENT_OPTIONS = INGREDIENT_DENSITIES.map((ingredient, index) => ({
  value: String(index),
  label: ingredient.name,
}))

function UnitSelect({
  value,
  onChange,
  label,
}: {
  value: ConversionUnit
  onChange: (unit: ConversionUnit) => void
  label: string
}) {
  return (
    <CatalogSelect
      options={UNIT_OPTIONS}
      value={value}
      ariaLabel={label}
      triggerClassName="min-w-0 flex-1"
      onValueChange={(next) => {
        const option = UNIT_OPTIONS.find((candidate) => candidate.value === next)

        if (option) {
          onChange(option.value)
        }
      }}
    />
  )
}

export function UnitConverter() {
  const [value, setValue] = useState('100')
  const [from, setFrom] = useState<ConversionUnit>('mL')
  const [to, setTo] = useState<ConversionUnit>('g')
  const [ingredientIndex, setIngredientIndex] = useState(0)
  const crossing = needsDensity(from, to)
  const amount = Number.parseFloat(value)
  const result =
    Number.isNaN(amount) || amount === 0
      ? null
      : convert(
          amount,
          from,
          to,
          crossing ? INGREDIENT_DENSITIES[ingredientIndex].density : undefined
        )

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="lg">
            <ScaleIcon data-icon="inline-start" />
            Convertisseur
          </Button>
        }
      />
      <DialogSheet>
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Convertisseur</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Valeur à convertir"
          />

          <div className="flex items-center gap-2">
            <UnitSelect value={from} onChange={setFrom} label="Unité de départ" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Inverser les unités"
              onClick={() => {
                setFrom(to)
                setTo(from)
              }}
            >
              <ArrowRightLeftIcon />
            </Button>
            <UnitSelect value={to} onChange={setTo} label="Unité d'arrivée" />
          </div>

          {crossing && (
            <CatalogSelect
              options={INGREDIENT_OPTIONS}
              value={String(ingredientIndex)}
              ariaLabel="Ingrédient"
              onValueChange={(next) => setIngredientIndex(Number(next))}
            />
          )}

          <div className="rounded-lg bg-muted px-4 py-5 text-center">
            {result === null ? (
              <p className="text-sm text-muted-foreground">Entre une valeur</p>
            ) : (
              <p className="text-3xl font-bold tabular-nums font-stretch-80%">
                {formatResult(result)}{' '}
                <span className="text-sm text-muted-foreground">{CONVERSION_UNITS[to].label}</span>
              </p>
            )}
          </div>
        </div>
      </DialogSheet>
    </Dialog>
  )
}

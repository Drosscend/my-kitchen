import { ArrowRightLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
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

function isConversionUnit(value: string): value is ConversionUnit {
  return Object.hasOwn(CONVERSION_UNITS, value)
}

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
    <Select
      value={value}
      onValueChange={(next) => {
        const unit = String(next)

        if (isConversionUnit(unit)) {
          onChange(unit)
        }
      }}
    >
      <SelectTrigger className="flex-1" aria-label={label}>
        <SelectValue>{CONVERSION_UNITS[value].label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CONVERSION_UNIT_VALUES.map((unit) => (
          <SelectItem key={unit} value={unit}>
            {CONVERSION_UNITS[unit].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
          crossing ? INGREDIENT_DENSITIES[ingredientIndex]?.density : undefined
        )

  return (
    <Card className="kraft-card">
      <CardHeader className="pb-2">
        <CardTitle className="kraft-title text-base">Convertisseur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
          <Select
            value={String(ingredientIndex)}
            onValueChange={(next) => next !== null && setIngredientIndex(Number(next))}
          >
            <SelectTrigger className="w-full" aria-label="Ingrédient">
              <SelectValue>{INGREDIENT_DENSITIES[ingredientIndex]?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {INGREDIENT_DENSITIES.map((ingredient, index) => (
                <SelectItem key={ingredient.name} value={String(index)}>
                  {ingredient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="rounded-md bg-muted/50 px-3 py-3 text-center">
          {result === null ? (
            <p className="text-sm text-muted-foreground">Entre une valeur</p>
          ) : (
            <p className="text-lg font-semibold">
              {formatResult(result)}{' '}
              <span className="text-sm text-muted-foreground">{CONVERSION_UNITS[to].label}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { type CatalogOption } from '~/inventory/catalog'

interface CatalogSelectProps {
  options: CatalogOption[]
  value: string
  onValueChange: (value: string) => void
  id?: string
  name?: string
  allLabel?: string
  triggerClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CatalogSelect({
  options,
  value,
  onValueChange,
  id,
  name,
  allLabel,
  triggerClassName,
  open,
  onOpenChange,
}: CatalogSelectProps) {
  const label =
    value === 'all' ? allLabel : (options.find((option) => option.value === value)?.label ?? value)

  return (
    <Select
      name={name}
      value={value}
      onValueChange={(next) => next !== null && onValueChange(next)}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger id={id} className={triggerClassName ?? 'w-full'}>
        <SelectValue>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {allLabel && <SelectItem value="all">{allLabel}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

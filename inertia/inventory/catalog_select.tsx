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
  name?: string
  allLabel?: string
  className?: string
  triggerClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * A select over one catalog list, with an optional "all" entry for the
 * filters.
 */
export function CatalogSelect({
  options,
  value,
  onValueChange,
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
      onValueChange={(next) => next !== null && onValueChange(String(next))}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger className={triggerClassName ?? 'w-full'}>
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

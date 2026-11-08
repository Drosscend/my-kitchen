import { type ReactNode } from 'react'
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
  ariaLabel?: string
  name?: string
  allLabel?: string
  icon?: (value: string) => ReactNode
  triggerClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CatalogSelect({
  options,
  value,
  onValueChange,
  id,
  ariaLabel,
  name,
  allLabel,
  icon,
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
      <SelectTrigger id={id} aria-label={ariaLabel} className={triggerClassName ?? 'w-full'}>
        <SelectValue>
          {icon?.(value)}
          {label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        className="min-w-0 rounded-lg shadow-[0_12px_24px_-12px_rgb(74_55_40/0.45)] ring-input"
      >
        {allLabel && (
          <SelectItem value="all">
            {icon && <span className="w-6 shrink-0" />}
            {allLabel}
          </SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {icon && <span className="flex w-6 shrink-0 justify-center">{icon(option.value)}</span>}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

import { cn } from 'cn'
import { CATEGORY_ICONS, CATEGORY_SWATCHES, type Ingredient } from '~/inventory/catalog'

interface CategoryMarkProps {
  category: Ingredient['category']
  size: 'xs' | 'sm' | 'md'
  className?: string
}

export function CategoryMark({ category, size, className }: CategoryMarkProps) {
  const Icon = CATEGORY_ICONS[category]

  return (
    <span
      aria-hidden
      data-size={size}
      data-swatch={CATEGORY_SWATCHES[category]}
      className={cn(
        'group/mark relative grid shrink-0 place-items-center data-[size=md]:size-9 data-[size=sm]:size-7 data-[size=xs]:size-6',
        className
      )}
    >
      <span className="absolute inset-1 translate-x-0.5 translate-y-0.5 rounded-full bg-(--swatch) opacity-80 group-data-[size=xs]/mark:inset-0.5" />
      <Icon
        className="relative group-data-[size=md]/mark:size-6 group-data-[size=sm]/mark:size-4.5 group-data-[size=xs]/mark:size-4"
        strokeWidth={1.75}
      />
    </span>
  )
}

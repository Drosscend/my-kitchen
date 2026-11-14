import { cn } from 'cn'
import { type ComponentProps } from 'react'
import { CATEGORY_SWATCHES, type Ingredient } from '~/inventory/catalog'
import { CategoryMark } from '~/inventory/category_mark'
import { ExpiryStamp } from '~/inventory/expiry_stamp'

type NoteIngredient = Pick<
  Ingredient,
  'name' | 'category' | 'quantity' | 'unitLabel' | 'expiryStatus' | 'expiresOn' | 'daysLeft'
>

interface StickyNoteProps extends ComponentProps<'li'> {
  ingredient: NoteIngredient
}

/**
 * An ingredient pinned with a magnet, tinted by how urgent it is.
 */
export function StickyNote({ ingredient, className, ...props }: StickyNoteProps) {
  return (
    <li
      {...props}
      data-status={ingredient.expiryStatus}
      data-swatch={CATEGORY_SWATCHES[ingredient.category]}
      className={cn(
        'relative flex min-h-27 flex-col gap-2.5 rounded-[3px_3px_10px_3px] bg-card px-3 pt-4 pb-3 text-left shadow-[0_1px_0_rgb(41_35_30/0.07),0_10px_18px_-12px_rgb(74_55_40/0.55)] after:absolute after:right-0 after:bottom-0 after:size-4.5 after:rounded-br-[10px] after:bg-linear-135 after:from-transparent after:from-50% after:to-[rgb(74_55_40/0.1)] after:to-50% sm:px-3.5 sm:pt-4.5 data-[status=expired]:bg-note-expired data-[status=soon]:bg-note-soon',
        className
      )}
    >
      <span aria-hidden className="magnet absolute -top-2.25 left-1/2 size-5 -translate-x-1/2" />
      <span className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 leading-tight font-bold sm:text-[17px]">
          {ingredient.name}
        </span>
        <CategoryMark category={ingredient.category} size="md" className="-mt-1" />
      </span>
      <span className="mt-auto flex items-center justify-between gap-2">
        <ExpiryStamp {...ingredient} className="-rotate-4 bg-transparent sm:h-6.5 sm:text-sm" />
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {ingredient.quantity} {ingredient.unitLabel}
        </span>
      </span>
    </li>
  )
}

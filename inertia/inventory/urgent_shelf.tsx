import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { type Batch, CATEGORY_SWATCHES, type Ingredient } from '~/inventory/catalog'
import { CategoryMark } from '~/inventory/category_mark'
import { isExpiringSoon } from '~/inventory/expiry'
import { ExpiryStamp } from '~/inventory/expiry_stamp'

const URGENCY_RANKS = {
  expired: 0,
  soon: 1,
  check: 2,
  ok: 3,
  none: 4,
} satisfies Record<Batch['expiryStatus'], number>

/**
 * The ingredients to eat first, most urgent on the left.
 */
export function UrgentShelf({ ingredients }: { ingredients: Ingredient[] }) {
  const shelf = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })
  const urgent = ingredients
    .filter((ingredient) => isExpiringSoon(ingredient.expiryStatus))
    .sort(
      (a, b) =>
        URGENCY_RANKS[a.expiryStatus] - URGENCY_RANKS[b.expiryStatus] ||
        (a.daysLeft ?? 0) - (b.daysLeft ?? 0)
    )

  if (urgent.length === 0) {
    return null
  }

  function measure(list: HTMLUListElement) {
    const start = list.scrollLeft <= 1
    const end = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1

    setEdges((current) =>
      current.start === start && current.end === end ? current : { start, end }
    )
  }

  function attach(list: HTMLUListElement | null) {
    shelf.current = list

    if (list) {
      measure(list)
    }
  }

  function scroll(direction: 1 | -1) {
    const list = shelf.current
    list?.scrollBy({ left: direction * list.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="urgent-title" className="mb-5 sm:mb-6">
      <div className="mb-1 flex items-center justify-between gap-4">
        <h2 id="urgent-title" className="text-xl">
          À consommer vite
        </h2>
        <div className="hidden gap-1.5 sm:flex">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Post-its précédents"
            disabled={edges.start}
            onClick={() => scroll(-1)}
            className="bg-card"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Post-its suivants"
            disabled={edges.end}
            onClick={() => scroll(1)}
            className="bg-card"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <ul
        ref={attach}
        onScroll={(event) => measure(event.currentTarget)}
        className="-mx-4 flex snap-x scroll-px-4 gap-3.5 overflow-x-auto px-4 pt-4 pb-5 [scrollbar-width:none] sm:mx-0 sm:gap-4.5 sm:scroll-px-1 sm:px-1"
      >
        {urgent.map((ingredient) => (
          <li
            key={ingredient.id}
            data-status={ingredient.expiryStatus}
            data-swatch={CATEGORY_SWATCHES[ingredient.category]}
            className="relative flex min-h-27 w-40 shrink-0 snap-start flex-col gap-2.5 rounded-[3px_3px_10px_3px] px-3 pt-4 pb-3 shadow-[0_1px_0_rgb(41_35_30/0.07),0_10px_18px_-12px_rgb(74_55_40/0.55)] after:absolute after:right-0 after:bottom-0 after:size-4.5 after:rounded-br-[10px] after:bg-linear-135 after:from-transparent after:from-50% after:to-[rgb(74_55_40/0.1)] after:to-50% sm:w-53 sm:px-3.5 sm:pt-4.5 bg-card nth-[4n+1]:-rotate-2 nth-[4n+2]:rotate-[1.5deg] nth-[4n+3]:-rotate-1 nth-[4n]:rotate-2 data-[status=expired]:bg-note-expired data-[status=soon]:bg-note-soon"
          >
            <span
              aria-hidden
              className="magnet absolute -top-2.25 left-1/2 size-5 -translate-x-1/2"
            />
            <span className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 leading-tight font-bold sm:text-[17px]">
                {ingredient.name}
              </span>
              <CategoryMark category={ingredient.category} size="md" className="-mt-1" />
            </span>
            <span className="mt-auto flex items-center justify-between gap-2">
              <ExpiryStamp
                {...ingredient}
                className="-rotate-4 bg-transparent sm:h-6.5 sm:text-sm"
              />
              <span className="text-sm text-muted-foreground tabular-nums">
                {ingredient.quantity} {ingredient.unitLabel}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

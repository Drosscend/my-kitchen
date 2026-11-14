import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { type Batch, type Ingredient } from '~/inventory/catalog'
import { isExpiringSoon } from '~/inventory/expiry'
import { StickyNote } from '~/inventory/sticky_note'

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
          <StickyNote
            key={ingredient.id}
            ingredient={ingredient}
            className="w-40 shrink-0 snap-start sm:w-53 nth-[4n+1]:-rotate-2 nth-[4n+2]:rotate-[1.5deg] nth-[4n+3]:-rotate-1 nth-[4n]:rotate-2"
          />
        ))}
      </ul>
    </section>
  )
}

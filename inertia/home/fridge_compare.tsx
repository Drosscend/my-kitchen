import { cn } from 'cn'
import { ChevronsLeftRightIcon } from 'lucide-react'
import { type CSSProperties, type ReactNode, useState } from 'react'
import { type Ingredient } from '~/inventory/catalog'
import { StickyNote } from '~/inventory/sticky_note'
import { type Swatch } from '~/swatch'

declare module 'react' {
  interface CSSProperties {
    '--cut'?: string
  }
}

function inDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)

  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
}

const notes: (Pick<
  Ingredient,
  'name' | 'category' | 'quantity' | 'unitLabel' | 'expiryStatus' | 'daysLeft'
> & { left: string; top: string; rotate: string })[] = [
  {
    name: 'Fraises',
    category: 'fruits',
    quantity: 250,
    unitLabel: 'g',
    expiryStatus: 'expired',
    daysLeft: -1,
    left: '5%',
    top: '4%',
    rotate: '-1.5deg',
  },
  {
    name: 'Épinards',
    category: 'vegetables',
    quantity: 250,
    unitLabel: 'g',
    expiryStatus: 'soon',
    daysLeft: 0,
    left: '51%',
    top: '4%',
    rotate: '1deg',
  },
  {
    name: 'Crème fraîche',
    category: 'dairy',
    quantity: 20,
    unitLabel: 'cl',
    expiryStatus: 'soon',
    daysLeft: 1,
    left: '5%',
    top: '33%',
    rotate: '1deg',
  },
  {
    name: 'Aubergine',
    category: 'vegetables',
    quantity: 350,
    unitLabel: 'g',
    expiryStatus: 'soon',
    daysLeft: 2,
    left: '51%',
    top: '33%',
    rotate: '-1deg',
  },
  {
    name: 'Yaourts',
    category: 'dairy',
    quantity: 4,
    unitLabel: 'pots',
    expiryStatus: 'soon',
    daysLeft: 3,
    left: '5%',
    top: '57%',
    rotate: '-0.5deg',
  },
  {
    name: 'Mozzarella',
    category: 'dairy',
    quantity: 125,
    unitLabel: 'g',
    expiryStatus: 'none',
    daysLeft: 5,
    left: '51%',
    top: '57%',
    rotate: '1.5deg',
  },
]

/**
 * One side of the door: the freezer seam and the two handles under
 * whatever is pinned to it.
 */
function Door({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'absolute inset-0 overflow-hidden rounded-[1.25rem_1.25rem_0.875rem_0.875rem] bg-linear-90 from-[#e6e1d6] via-[#f7f5f0] via-14% to-[#e6e1d6] shadow-[inset_0_0_0_3px_rgb(255_255_255/0.55)]',
        className
      )}
    >
      <span className="absolute inset-x-0 top-[27%] h-0.5 bg-[#d0c9b9] shadow-[0_1px_0_rgb(255_255_255/0.9)]" />
      <span className="absolute top-[9%] left-3.5 h-[12%] w-2 rounded-md bg-linear-90 from-[#a49c8b] via-[#e9e5dc] to-[#a49c8b] shadow-[0_4px_6px_-3px_rgb(41_35_30/0.5)]" />
      <span className="absolute top-[32%] left-3.5 h-[20%] w-2 rounded-md bg-linear-90 from-[#a49c8b] via-[#e9e5dc] to-[#a49c8b] shadow-[0_4px_6px_-3px_rgb(41_35_30/0.5)]" />
      {children}
    </div>
  )
}

/**
 * A handwritten note stuck on the door the old way.
 */
function PostIt({
  tint,
  swatch,
  style,
  className,
  children,
}: {
  tint?: 'pink' | 'blue' | 'green'
  swatch?: Swatch
  style: CSSProperties
  className?: string
  children: ReactNode
}) {
  return (
    <p
      data-tint={tint}
      style={style}
      className={cn(
        'absolute w-[40%] bg-[#fff3a6] px-[5%] pt-[7%] pb-[6%] font-hand text-[clamp(1rem,4.4vw,1.3rem)] leading-none font-bold text-[#2f2a24] shadow-[0_8px_10px_-8px_rgb(41_35_30/0.55)] data-[tint=blue]:bg-[#d6e9f6] data-[tint=green]:bg-[#dcefc9] data-[tint=pink]:bg-[#ffd9c9] [&_s]:text-[#8b7d6b] [&_s]:decoration-2',
        className
      )}
    >
      {swatch && (
        <span
          aria-hidden
          data-swatch={swatch}
          className="magnet absolute -top-2 left-1/2 size-3.5 -translate-x-1/2"
        />
      )}
      {children}
    </p>
  )
}

/**
 * The same fridge twice, split by a seam the visitor drags: post-its with
 * dates nobody remembers on one side, the app's notes sorted by urgency on
 * the other.
 */
export function FridgeCompare() {
  const [cut, setCut] = useState(50)
  const [moved, setMoved] = useState(false)
  const [glide, setGlide] = useState(false)

  function show(value: number, animate: boolean) {
    setMoved(true)
    setGlide(animate)
    setCut(value)
  }

  function toggleSide(target: number) {
    show(cut === target ? 50 : target, true)
  }

  return (
    <figure className="mx-auto grid w-full max-w-95 gap-4.5">
      <div
        data-hint={moved ? undefined : ''}
        data-glide={glide ? '' : undefined}
        style={{ '--cut': `${cut}%` }}
        className="relative isolate aspect-5/7 rounded-[1.375rem_1.375rem_1rem_1rem] border-2 border-[#d5cebf] shadow-[0_34px_40px_-30px_rgb(41_35_30/0.65)] select-none before:absolute before:-bottom-2.25 before:left-5.5 before:-z-10 before:h-2.25 before:w-6.5 before:rounded-b-[5px] before:bg-[#a79f8e] after:absolute after:right-5.5 after:-bottom-2.25 after:-z-10 after:h-2.25 after:w-6.5 after:rounded-b-[5px] after:bg-[#a79f8e] data-glide:transition-[--cut] data-glide:duration-700 data-hint:animate-fridge-nudge motion-reduce:animate-none motion-reduce:transition-none"
      >
        <Door>
          <PostIt
            style={{ left: '9%', top: '5%', rotate: '-3deg' }}
            tint="blue"
            className="before:absolute before:-top-2.25 before:left-1/2 before:h-4.5 before:w-[46%] before:-translate-x-1/2 before:rotate-4 before:bg-mustard/55"
          >
            yaourts : lequel d'abord ?
          </PostIt>
          <PostIt style={{ left: '53%', top: '5%', rotate: '2.5deg' }} tint="pink" swatch="sage">
            mozza ouverte <s>hier</s> avant-hier ?
          </PostIt>
          <PostIt style={{ left: '8%', top: '34%', rotate: '-4deg' }} swatch="tomato">
            crème ouverte <span className="text-tomato">quand</span> ??
          </PostIt>
          <PostIt style={{ left: '53%', top: '37%', rotate: '3deg' }} tint="pink" swatch="mustard">
            fraises <s>mardi</s> <s>mer.</s> encore bonnes ?
          </PostIt>
          <PostIt style={{ left: '11%', top: '64%', rotate: '2deg' }} tint="green" swatch="sage">
            épinards avant… samedi ?
          </PostIt>
          <PostIt style={{ left: '54%', top: '67%', rotate: '-2deg' }} swatch="cornflower">
            aubergine achetée lundi (?)
          </PostIt>
        </Door>

        <Door className="[clip-path:inset(0_0_0_var(--cut))]">
          <ul>
            {notes.map(({ left, top, rotate, ...note }) => (
              <StickyNote
                key={note.name}
                ingredient={{ ...note, expiresOn: inDays(note.daysLeft ?? 0) }}
                style={{ left, top, rotate }}
                className="absolute min-h-0 w-[44%] gap-1.5 px-2 pt-3.5 pb-2 text-[15px] sm:px-2.5 sm:pt-3.5"
              />
            ))}
          </ul>
          <p className="absolute right-[9%] bottom-[17%] -rotate-3 font-hand text-xl font-bold text-primary/80">
            ↑ le plus pressé en haut
          </p>
        </Door>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[1.25rem_1.25rem_0.875rem_0.875rem] bg-linear-115 from-white/50 via-white/0 via-22% to-white/0"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-y-2 left-(--cut) z-20 w-0.75 -translate-x-1/2 rounded-full bg-primary"
        >
          <span className="absolute top-[88%] left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_4px_rgb(255_254_251/0.85),0_8px_12px_-6px_rgb(41_35_30/0.6)]">
            <ChevronsLeftRightIcon className="size-5" strokeWidth={2.5} />
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={cut}
          onChange={(event) => show(Number(event.target.value), false)}
          aria-label="Comparer le frigo sans et avec Mon Garde-Manger"
          className="absolute -inset-y-2 left-0 z-30 h-[calc(100%+1rem)] w-full cursor-ew-resize touch-pan-y opacity-0"
        />
      </div>

      <figcaption className="flex justify-between gap-3 text-sm">
        <button
          type="button"
          aria-pressed={cut >= 75}
          onClick={() => toggleSide(100)}
          className="border-b-2 border-transparent py-1.5 font-bold text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-primary aria-pressed:text-foreground"
        >
          Sans l'app
        </button>
        <button
          type="button"
          aria-pressed={cut <= 25}
          onClick={() => toggleSide(0)}
          className="border-b-2 border-transparent py-1.5 font-bold text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-primary aria-pressed:text-foreground"
        >
          Avec Mon Garde-Manger
        </button>
      </figcaption>
    </figure>
  )
}

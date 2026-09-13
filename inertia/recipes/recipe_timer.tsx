import { PlayIcon, RotateCcwIcon, SquareIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { type TimerState } from '~/cooking/types'
import { formatTimer } from '~/recipes/format'

interface RecipeTimerProps {
  id: string
  duration: number
  timer?: TimerState
  onStart: (id: string, duration: number) => void
  onStop: (id: string) => void
  onReset: (id: string) => void
}

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

export function RecipeTimer({ id, duration, timer, onStart, onStop, onReset }: RecipeTimerProps) {
  const running = timer?.running ?? false
  const paused = timer !== undefined && !timer.running && timer.remaining > 0
  const done = timer !== undefined && timer.remaining === 0
  const remaining = timer?.remaining ?? duration

  const main = done
    ? { label: 'Terminé !', icon: RotateCcwIcon, action: () => onReset(id) }
    : running
      ? { label: 'Pause', icon: SquareIcon, action: () => onStop(id) }
      : paused
        ? { label: 'Reprendre', icon: PlayIcon, action: () => onStart(id, duration) }
        : { label: 'Démarrer', icon: PlayIcon, action: () => onStart(id, duration) }
  const MainIcon = main.icon
  const accent = done ? '' : 'border-accent/40 text-accent hover:bg-accent/10 hover:text-accent'

  return (
    <div className="flex items-center justify-center gap-3 border-t border-border px-4 py-3">
      <Button
        size="lg"
        variant={done ? 'secondary' : 'outline'}
        className={`h-16 w-full max-w-72 gap-4 rounded-xl border-2 ${accent}`}
        onClick={main.action}
      >
        <span className="text-4xl font-semibold sm:text-5xl" style={TABULAR}>
          {formatTimer(remaining)}
        </span>
        <span className="flex items-center gap-2 text-base">
          <MainIcon className="size-5" /> {main.label}
        </span>
      </Button>
      {(running || paused) && (
        <Button
          size="icon-lg"
          variant="ghost"
          className="size-14 shrink-0 rounded-xl text-muted-foreground [&_svg]:size-6"
          aria-label="Réinitialiser le chrono"
          onClick={() => onReset(id)}
        >
          <RotateCcwIcon />
        </Button>
      )}
    </div>
  )
}

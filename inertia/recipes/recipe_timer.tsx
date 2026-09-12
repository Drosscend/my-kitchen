import { PlayIcon, RotateCcwIcon, SquareIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { type TimerState } from '~/cooking/types'
import { formatDuration, formatTimer } from '~/recipes/format'

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

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="text-5xl font-semibold text-accent" style={TABULAR}>
        {formatTimer(remaining)}
      </div>
      <div className="text-sm text-muted-foreground">{formatDuration(duration)}</div>
      <div className="mt-2 flex items-center gap-2">
        {done ? (
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full px-6"
            onClick={() => onReset(id)}
          >
            Terminé ! <RotateCcwIcon data-icon="inline-end" />
          </Button>
        ) : paused ? (
          <>
            <Button size="lg" className="rounded-full px-6" onClick={() => onStart(id, duration)}>
              <PlayIcon data-icon="inline-start" /> Reprendre
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              aria-label="Réinitialiser le chrono"
              onClick={() => onReset(id)}
            >
              <RotateCcwIcon />
            </Button>
          </>
        ) : running ? (
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-6"
            onClick={() => onStop(id)}
          >
            <SquareIcon data-icon="inline-start" /> Pause
          </Button>
        ) : (
          <Button size="lg" className="rounded-full px-6" onClick={() => onStart(id, duration)}>
            <PlayIcon data-icon="inline-start" /> Démarrer
          </Button>
        )}
      </div>
    </div>
  )
}

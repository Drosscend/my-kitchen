import { CheckIcon, PlayIcon, RotateCcwIcon, SquareIcon } from 'lucide-react'
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
  size?: 'default' | 'large'
}

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

export function RecipeTimer({
  id,
  duration,
  timer,
  onStart,
  onStop,
  onReset,
  size = 'default',
}: RecipeTimerProps) {
  const running = timer?.running ?? false
  const paused = timer !== undefined && !timer.running && timer.remaining > 0
  const done = timer !== undefined && timer.remaining === 0
  const remaining = timer?.remaining ?? duration

  if (size === 'large') {
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
              Terminé ! <RotateCcwIcon className="size-4" />
            </Button>
          ) : paused ? (
            <>
              <Button size="lg" className="rounded-full px-6" onClick={() => onStart(id, duration)}>
                <PlayIcon className="size-4" /> Reprendre
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
              <SquareIcon className="size-4" /> Pause
            </Button>
          ) : (
            <Button size="lg" className="rounded-full px-6" onClick={() => onStart(id, duration)}>
              <PlayIcon className="size-4" /> Démarrer
            </Button>
          )}
        </div>
      </div>
    )
  }

  const pill =
    'relative top-px inline-flex items-center gap-1 rounded-full px-1.5 text-sm transition-colors'

  return (
    <>
      {formatDuration(duration)}{' '}
      {done ? (
        <button
          type="button"
          onClick={() => onReset(id)}
          aria-label="Réinitialiser le chrono"
          className={`${pill} bg-accent/20 text-accent`}
        >
          <CheckIcon className="size-3" />
        </button>
      ) : paused ? (
        <span className="relative top-px inline-flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onStart(id, duration)}
            aria-label="Reprendre le chrono"
            className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-1.5 text-sm text-accent transition-colors hover:bg-accent/25"
          >
            <PlayIcon className="size-3" />
            <span style={TABULAR}>{formatTimer(remaining)}</span>
          </button>
          <button
            type="button"
            onClick={() => onReset(id)}
            aria-label="Réinitialiser le chrono"
            className="inline-flex items-center rounded-full px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcwIcon className="size-3" />
          </button>
        </span>
      ) : running ? (
        <button
          type="button"
          onClick={() => onStop(id)}
          aria-label="Mettre en pause le chrono"
          className={`${pill} bg-accent/15 text-accent hover:bg-accent/25`}
        >
          <SquareIcon className="size-3" />
          <span style={TABULAR}>{formatTimer(remaining)}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onStart(id, duration)}
          aria-label="Démarrer le chrono"
          className={`${pill} bg-muted/60 text-muted-foreground hover:bg-muted`}
        >
          <PlayIcon className="size-3" />
          <span style={TABULAR}>{formatTimer(remaining)}</span>
        </button>
      )}
    </>
  )
}

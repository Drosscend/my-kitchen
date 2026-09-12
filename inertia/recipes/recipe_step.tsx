import { CheckIcon } from 'lucide-react'
import { type ActiveTimers } from '~/cooking/types'
import { formatDuration, formatIngredient, splitStep } from '~/recipes/format'
import { RecipeTimer } from '~/recipes/recipe_timer'
import { type RecipeIngredient, type RecipeStep } from '~/recipes/types'

interface RecipeStepProps {
  step: RecipeStep
  index: number
  completed: boolean
  onToggle: (ref: string) => void
  ingredients: Map<string, RecipeIngredient>
  scale: number
  timers?: {
    active: ActiveTimers
    onStart: (id: string, duration: number) => void
    onStop: (id: string) => void
    onReset: (id: string) => void
  }
}

export function RecipeStepDisplay({
  step,
  index,
  completed,
  onToggle,
  ingredients,
  scale,
  timers,
}: RecipeStepProps) {
  const parts = splitStep(step, ingredients, { appendTimer: true })

  return (
    <div className={`flex items-start gap-3 ${completed ? 'opacity-60' : ''}`}>
      <button
        type="button"
        onClick={() => onToggle(step.ref)}
        aria-label={completed ? 'Marquer comme non faite' : 'Marquer comme faite'}
        className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-all ${
          completed
            ? 'border-accent bg-accent text-accent-foreground'
            : 'border-border text-muted-foreground hover:border-accent'
        }`}
      >
        {completed ? <CheckIcon className="size-4" /> : index + 1}
      </button>
      <div
        className={`text-base leading-relaxed ${completed ? 'line-through decoration-muted-foreground' : ''}`}
      >
        {step.title && <span className="font-semibold">{step.title} : </span>}
        {parts.map((part, partIndex) => {
          const key = `${step.ref}-${partIndex}`

          if (part.kind === 'text') {
            return <span key={key}>{part.text}</span>
          }

          if (part.kind === 'ingredient') {
            return (
              <span key={key} className={completed ? 'text-muted-foreground' : ''}>
                {formatIngredient(part.ingredient, scale)}
              </span>
            )
          }

          return timers ? (
            <RecipeTimer
              key={key}
              id={step.ref}
              duration={step.timerSeconds ?? 0}
              timer={timers.active[step.ref]}
              onStart={timers.onStart}
              onStop={timers.onStop}
              onReset={timers.onReset}
            />
          ) : (
            <span key={key}>{formatDuration(step.timerSeconds ?? 0)}</span>
          )
        })}
      </div>
    </div>
  )
}

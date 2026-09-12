import { cn } from 'cn'
import { CheckIcon } from 'lucide-react'
import { formatDuration, formatIngredient, splitStep } from '~/recipes/format'
import { type RecipeIngredient, type RecipeStep } from '~/recipes/types'

interface RecipeStepProps {
  step: RecipeStep
  index: number
  completed: boolean
  onToggle: (ref: string) => void
  ingredients: Map<string, RecipeIngredient>
  scale: number
}

export function RecipeStepDisplay({
  step,
  index,
  completed,
  onToggle,
  ingredients,
  scale,
}: RecipeStepProps) {
  const parts = splitStep(step, ingredients, { appendTimer: true })

  return (
    <div className={cn('flex items-start gap-3', completed && 'opacity-60')}>
      <button
        type="button"
        onClick={() => onToggle(step.ref)}
        aria-pressed={completed}
        aria-label={completed ? 'Marquer comme non faite' : 'Marquer comme faite'}
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-all',
          completed
            ? 'border-accent bg-accent text-accent-foreground'
            : 'border-border text-muted-foreground hover:border-accent'
        )}
      >
        {completed ? <CheckIcon className="size-4" /> : index + 1}
      </button>
      <div
        className={cn(
          'text-base leading-relaxed',
          completed && 'line-through decoration-muted-foreground'
        )}
      >
        {step.title && <span className="font-semibold">{step.title} : </span>}
        {parts.map((part, partIndex) => {
          const key = `${step.ref}-${partIndex}`

          if (part.kind === 'text') {
            return <span key={key}>{part.text}</span>
          }

          if (part.kind === 'ingredient') {
            return (
              <span key={key} className={cn(completed && 'text-muted-foreground')}>
                {formatIngredient(part.ingredient, scale)}
              </span>
            )
          }

          return <span key={key}>{formatDuration(part.seconds)}</span>
        })}
      </div>
    </div>
  )
}

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
}

export function RecipeStepDisplay({
  step,
  index,
  completed,
  onToggle,
  ingredients,
}: RecipeStepProps) {
  const parts = splitStep(step, ingredients, { appendTimer: true })

  return (
    <li className={cn('flex items-start gap-4 transition-opacity', completed && 'opacity-55')}>
      <button
        type="button"
        onClick={() => onToggle(step.ref)}
        aria-pressed={completed}
        aria-label={completed ? 'Marquer comme non faite' : 'Marquer comme faite'}
        className={cn(
          'flex size-10 shrink-0 -rotate-4 cursor-pointer items-center justify-center rounded-[52%_46%_50%_48%/48%_52%_46%_50%] border-2 border-primary text-[19px] font-extrabold text-primary tabular-nums transition-colors font-stretch-80%',
          completed ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
        )}
      >
        {completed ? <CheckIcon className="size-5" /> : index + 1}
      </button>
      <div
        className={cn(
          'pt-1.5 text-base leading-relaxed text-pretty sm:text-lg sm:leading-relaxed',
          completed && 'line-through decoration-muted-foreground'
        )}
      >
        {step.title && <span className="block font-semibold">{step.title}</span>}
        {parts.map((part, partIndex) => {
          const key = `${step.ref}-${partIndex}`

          if (part.kind === 'text') {
            return <span key={key}>{part.text}</span>
          }

          if (part.kind === 'ingredient') {
            return (
              <span key={key} className="highlight px-0.5 font-semibold">
                {formatIngredient(part.ingredient)}
              </span>
            )
          }

          return <span key={key}>{formatDuration(part.seconds)}</span>
        })}
      </div>
    </li>
  )
}

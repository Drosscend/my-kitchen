import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  QrCodeIcon,
  TimerIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { type ActiveTimers } from '~/cooking/types'
import { useCookingNavigation } from '~/cooking/use_cooking_navigation'
import { formatIngredient, formatTimer, ingredientsByRef, resolveStep } from '~/recipes/format'
import { RecipeTimer } from '~/recipes/recipe_timer'
import { type Recipe } from '~/recipes/types'

interface CookingModeProps {
  recipe: Recipe
  scale: number
  currentStepIndex: number
  activeTimers: ActiveTimers
  onPrevStep: () => void
  onNextStep: () => void
  onGoToStep: (index: number) => void
  onExit: () => void
  onStartTimer: (id: string, duration: number) => void
  onStopTimer: (id: string) => void
  onResetTimer: (id: string) => void
  onShare: () => void
}

export function CookingMode({
  recipe,
  scale,
  currentStepIndex,
  activeTimers,
  onPrevStep,
  onNextStep,
  onGoToStep,
  onExit,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onShare,
}: CookingModeProps) {
  const totalSteps = recipe.steps.length
  const onIngredients = currentStepIndex === -1
  const currentStep = onIngredients ? null : recipe.steps[currentStepIndex]
  const ingredients = ingredientsByRef(recipe.ingredients)
  const lastStep = currentStepIndex >= totalSteps - 1
  const { handleTouchStart, handleTouchEnd } = useCookingNavigation({
    onPrev: onPrevStep,
    onNext: onNextStep,
    onExit,
    canGoPrev: !onIngredients,
    canGoNext: !lastStep,
  })
  const runningTimers = recipe.steps
    .map((step, index) => ({ step, index, timer: activeTimers[step.ref] }))
    .filter(({ timer }) => timer?.running)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <div className="flex items-center justify-between border-b border-border p-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <XIcon data-icon="inline-start" /> Quitter
        </Button>
        <span className="text-sm text-muted-foreground">
          {onIngredients ? 'Ingrédients' : `Étape ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <div className="flex w-16 justify-end">
          <Button variant="ghost" size="icon-sm" onClick={onShare} aria-label="Partager la session">
            <QrCodeIcon />
          </Button>
        </div>
      </div>

      <div className="h-1 bg-muted" aria-hidden>
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-auto p-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-lg text-center">
          {onIngredients ? (
            <>
              <h2 className="kraft-title mb-6 text-2xl font-bold">Ingrédients</h2>
              <ul className="space-y-2 text-left text-lg">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.ref}>{formatIngredient(ingredient, scale)}</li>
                ))}
              </ul>
            </>
          ) : currentStep ? (
            <>
              {currentStep.title && (
                <h2 className="kraft-title mb-4 text-2xl font-bold">{currentStep.title}</h2>
              )}
              {currentStep.timerSeconds && (
                <RecipeTimer
                  id={currentStep.ref}
                  duration={currentStep.timerSeconds}
                  timer={activeTimers[currentStep.ref]}
                  onStart={onStartTimer}
                  onStop={onStopTimer}
                  onReset={onResetTimer}
                />
              )}
              <p className="mt-4 text-lg leading-relaxed text-foreground/80">
                {resolveStep(currentStep, ingredients, scale)}
              </p>
            </>
          ) : null}
        </div>
      </div>

      {runningTimers.length > 0 && (
        <div className="flex items-center justify-center gap-4 border-t border-border bg-accent/10 px-4 py-2">
          {runningTimers.map(({ step, index, timer }) => (
            <button
              key={step.ref}
              type="button"
              onClick={() => onGoToStep(index)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm text-accent transition-colors hover:bg-accent/20"
            >
              <TimerIcon className="size-3.5" />
              <span className="font-medium">{step.title ?? `Étape ${index + 1}`}</span>
              <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTimer(timer.remaining)}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border p-4">
        <Button variant="outline" onClick={onPrevStep} disabled={onIngredients}>
          <ArrowLeftIcon data-icon="inline-start" /> Préc.
        </Button>
        <Button onClick={lastStep ? onExit : onNextStep}>
          {lastStep ? (
            <>
              Terminer <CheckIcon data-icon="inline-end" />
            </>
          ) : (
            <>
              Suiv. <ArrowRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

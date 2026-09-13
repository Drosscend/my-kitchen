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
  onFinish: () => void
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
  onFinish,
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
  const otherRunningTimers = recipe.steps
    .map((step, index) => ({ step, index, timer: activeTimers[step.ref] }))
    .filter(({ timer, index }) => timer?.running && index !== currentStepIndex)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <div className="flex items-center justify-between border-b border-border p-4">
        <Button variant="ghost" onClick={onExit}>
          <XIcon data-icon="inline-start" /> Quitter
        </Button>
        <span className="text-base text-muted-foreground">
          {onIngredients ? 'Ingrédients' : `Étape ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <div className="flex w-16 justify-end">
          <Button variant="ghost" size="icon-lg" onClick={onShare} aria-label="Partager la session">
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
        className="flex-1 overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex min-h-full items-center justify-center px-6 py-8 sm:px-8">
          <div className="w-full max-w-3xl">
            {onIngredients ? (
              <>
                <h2 className="kraft-title mb-8 text-center text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Ingrédients
                </h2>
                <ul className="mx-auto max-w-xl space-y-4 text-xl sm:text-2xl lg:text-3xl">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.ref} className="flex items-baseline gap-3">
                      <span className="size-2 shrink-0 rounded-full bg-accent/60" />
                      <span>{formatIngredient(ingredient, scale)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : currentStep ? (
              <>
                {currentStep.title && (
                  <h2 className="kraft-title mb-6 text-center text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {currentStep.title}
                  </h2>
                )}
                <p className="text-xl leading-relaxed text-foreground/80 sm:text-2xl sm:leading-relaxed lg:text-3xl lg:leading-relaxed">
                  {resolveStep(currentStep, ingredients, scale)}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {currentStep?.timerSeconds && (
        <RecipeTimer
          id={currentStep.ref}
          duration={currentStep.timerSeconds}
          timer={activeTimers[currentStep.ref]}
          onStart={onStartTimer}
          onStop={onStopTimer}
          onReset={onResetTimer}
        />
      )}

      {otherRunningTimers.length > 0 && (
        <div className="flex items-center justify-center gap-4 border-t border-border bg-accent/10 px-4 py-2">
          {otherRunningTimers.map(({ step, index, timer }) => (
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

      <div className="flex items-center justify-between gap-4 border-t border-border p-4">
        <Button
          variant="outline"
          size="lg"
          className="h-12 flex-1 text-base sm:min-w-40 sm:flex-none"
          onClick={onPrevStep}
          disabled={onIngredients}
        >
          <ArrowLeftIcon data-icon="inline-start" /> Préc.
        </Button>
        <Button
          size="lg"
          className="h-12 flex-1 text-base sm:min-w-40 sm:flex-none"
          onClick={lastStep ? onFinish : onNextStep}
        >
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

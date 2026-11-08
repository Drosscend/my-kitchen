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
    <div className="fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14 items-center justify-between gap-4 px-2 sm:px-4">
        <Button variant="ghost" onClick={onExit}>
          <XIcon data-icon="inline-start" /> Quitter
        </Button>
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {onIngredients ? 'Ingrédients' : `Étape ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <div className="flex w-16 justify-end">
          <Button variant="ghost" size="icon-lg" onClick={onShare} aria-label="Partager la session">
            <QrCodeIcon />
          </Button>
        </div>
      </div>

      <div className="h-1 bg-secondary" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-300"
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
                <h2 className="mb-8 text-3xl sm:text-4xl lg:text-5xl">Ingrédients</h2>
                <ul className="divide-y divide-ruling text-xl sm:text-2xl lg:text-3xl">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.ref} className="py-3 sm:py-4">
                      {formatIngredient(ingredient)}
                    </li>
                  ))}
                </ul>
              </>
            ) : currentStep ? (
              <>
                {currentStep.title && (
                  <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl">{currentStep.title}</h2>
                )}
                <p className="text-2xl leading-snug text-pretty sm:text-3xl sm:leading-snug lg:text-4xl lg:leading-snug">
                  {resolveStep(currentStep, ingredients)}
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
        <div className="flex flex-wrap items-center justify-center gap-2 border-t bg-secondary px-4 py-2">
          {otherRunningTimers.map(({ step, index, timer }) => (
            <button
              key={step.ref}
              type="button"
              onClick={() => onGoToStep(index)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm text-primary transition-colors hover:bg-background"
            >
              <TimerIcon className="size-3.5" />
              <span className="font-medium">{step.title ?? `Étape ${index + 1}`}</span>
              <span className="font-semibold tabular-nums">{formatTimer(timer.remaining)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t p-4">
        <Button
          variant="outline"
          size="lg"
          className="h-14 flex-1 text-base sm:min-w-44 sm:flex-none"
          onClick={onPrevStep}
          disabled={onIngredients}
        >
          <ArrowLeftIcon data-icon="inline-start" /> Précédent
        </Button>
        <Button
          size="lg"
          className="h-14 flex-[2] text-base sm:min-w-44 sm:flex-none"
          onClick={lastStep ? onFinish : onNextStep}
        >
          {lastStep ? (
            <>
              Terminer <CheckIcon data-icon="inline-end" />
            </>
          ) : (
            <>
              Suivant <ArrowRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

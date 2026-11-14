import { useRouter } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { CookingMode } from '~/cooking/cooking_mode'
import { useCookingDemo } from '~/cooking/use_cooking_demo'
import { type Recipe } from '~/recipes/types'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ recipe: Recipe }>

/**
 * Opens on the oven step and its 45 minute timer. Every frame moves to
 * the real session once one of them shares the demo, and the frame that
 * shared it shows the QR code.
 */
export default function CookingDemo({ recipe }: PageProps) {
  const router = useRouter()
  const demo = useCookingDemo(recipe.steps.length, 7, (code, sharer) =>
    router.visit({
      route: 'cooking.show',
      routeParams: { code },
      qs: sharer ? { share: 1 } : {},
    })
  )

  return (
    <>
      <Head title="Démo du mode cuisine" />
      <CookingMode
        recipe={recipe}
        currentStepIndex={demo.currentStepIndex}
        activeTimers={demo.activeTimers}
        onPrevStep={demo.prevStep}
        onNextStep={demo.nextStep}
        onGoToStep={demo.goToStep}
        onExit={demo.restart}
        onFinish={demo.restart}
        onStartTimer={demo.startTimer}
        onStopTimer={demo.stopTimer}
        onResetTimer={demo.resetTimer}
        onShare={demo.share}
      />
    </>
  )
}

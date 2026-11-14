import { useRouter } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { client } from '~/client'
import { CookingMode } from '~/cooking/cooking_mode'
import { ShareSessionDialog } from '~/cooking/share_session_dialog'
import { type CookingSessionPayload } from '~/cooking/types'
import { useCookingSession } from '~/cooking/use_cooking_session'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ session: CookingSessionPayload }>

export default function CookingSession({ session: initial, user }: PageProps) {
  const router = useRouter()
  const session = useCookingSession(initial)
  const [showQr, setShowQr] = useState(() =>
    new URLSearchParams(window.location.search).has('share')
  )
  const shareUrl = `${window.location.origin}${client.urlFor('cooking.show', { code: initial.code })}`

  function exit() {
    router.visit({ route: user ? 'recipes.index' : 'cooking.join' })
  }

  return (
    <>
      <Head title={session.recipe.title} />
      {session.closed || session.expired ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
          <p className="text-lg">
            {session.expired ? 'Session introuvable ou expirée' : 'Session terminée'}
          </p>
        </main>
      ) : (
        <CookingMode
          recipe={session.recipe}
          currentStepIndex={session.currentStepIndex}
          activeTimers={session.activeTimers}
          onPrevStep={session.prevStep}
          onNextStep={session.nextStep}
          onGoToStep={session.goToStep}
          onExit={exit}
          onFinish={() => {
            session.close()
            exit()
          }}
          onStartTimer={session.startTimer}
          onStopTimer={session.stopTimer}
          onResetTimer={session.resetTimer}
          onShare={() => setShowQr(true)}
        />
      )}

      <ShareSessionDialog
        code={initial.code}
        url={shareUrl}
        open={showQr}
        onOpenChange={setShowQr}
      />
    </>
  )
}

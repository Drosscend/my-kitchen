import { useRouter } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { client } from '~/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { CookingMode } from '~/cooking/cooking_mode'
import { type CookingSessionPayload } from '~/cooking/types'
import { useCookingSession } from '~/cooking/use_cooking_session'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ session: CookingSessionPayload }>

export default function CookingSession({ session: initial, user }: PageProps) {
  const router = useRouter()
  const session = useCookingSession(initial)
  const [showQr, setShowQr] = useState(false)
  const shareUrl = `${window.location.origin}${client.urlFor('cooking.show', { code: initial.code })}`

  function exit() {
    router.visit({ route: user ? 'recipes.index' : 'cooking.join' })
  }

  return (
    <>
      <Head title={session.recipe.title} />
      {session.closed ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
          <p className="text-lg">Session terminée</p>
        </main>
      ) : (
        <CookingMode
          recipe={session.recipe}
          scale={session.scale}
          currentStepIndex={session.currentStepIndex}
          activeTimers={session.activeTimers}
          onPrevStep={session.prevStep}
          onNextStep={session.nextStep}
          onGoToStep={session.goToStep}
          onExit={exit}
          onStartTimer={session.startTimer}
          onStopTimer={session.stopTimer}
          onResetTimer={session.resetTimer}
          onShare={() => setShowQr(true)}
        />
      )}

      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="kraft-title text-lg">Scanner pour rejoindre</DialogTitle>
            <DialogDescription>
              Scanne le QR code ou saisis le code sur un autre appareil
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center rounded-lg bg-white p-4">
            <QRCodeSVG value={shareUrl} size={200} level="M" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-[0.3em]">{initial.code}</p>
          <p className="text-xs break-all text-muted-foreground">{shareUrl}</p>
        </DialogContent>
      </Dialog>
    </>
  )
}

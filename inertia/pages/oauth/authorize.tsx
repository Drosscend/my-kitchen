import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { TriangleAlertIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  uid: string
  clientName: string
  redirectHost: string
  local: boolean
}>

export default function Authorize({ uid, clientName, redirectHost, local }: PageProps) {
  return (
    <>
      <Head title="Autoriser un assistant" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <img src="/logo.svg" alt="" className="mb-6 size-16" />
        <section className="kraft-card space-y-6 rounded-lg p-6 sm:p-8">
          <h1 className="kraft-title text-3xl font-bold text-primary">Autoriser {clientName} ?</h1>
          <p className="text-sm">
            <strong>{clientName}</strong> pourra lire et modifier ton garde-manger et tes recettes
            tant que tu ne révoques pas son accès depuis ton compte.
          </p>
          <p className="text-sm text-muted-foreground">
            Tu seras renvoyé vers{' '}
            <strong className="break-all text-foreground">{redirectHost}</strong>.
          </p>
          {local && (
            <p className="flex gap-2 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              Cette application tourne sur ton ordinateur. Autorise-la seulement si tu viens de
              lancer la connexion toi-même.
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Form route="oauth.authorization.deny" routeParams={{ uid }}>
              {({ processing }) => (
                <Button type="submit" variant="ghost" disabled={processing} className="w-full">
                  Refuser
                </Button>
              )}
            </Form>
            <Form route="oauth.authorization.approve" routeParams={{ uid }}>
              {({ processing }) => (
                <Button type="submit" disabled={processing} className="w-full">
                  Autoriser
                </Button>
              )}
            </Form>
          </div>
        </section>
      </main>
    </>
  )
}

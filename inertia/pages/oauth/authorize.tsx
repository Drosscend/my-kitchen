import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { TriangleAlertIcon } from 'lucide-react'
import { AuthShell } from '~/components/auth_shell'
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
      <AuthShell title={`Autoriser ${clientName} ?`}>
        <div className="flex flex-col gap-5">
          <p className="text-sm">
            <strong>{clientName}</strong> pourra lire et modifier ton garde-manger et tes recettes
            tant que tu ne révoques pas son accès depuis ton compte.
          </p>
          <p className="text-sm text-muted-foreground">
            Tu seras renvoyé vers{' '}
            <strong className="break-all text-foreground">{redirectHost}</strong>.
          </p>
          {local && (
            <p className="flex gap-2 rounded-md border border-warning bg-warning/15 p-3 text-sm text-warning-foreground">
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
        </div>
      </AuthShell>
    </>
  )
}

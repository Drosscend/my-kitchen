import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { AuthShell } from '~/components/auth_shell'
import { Button } from '~/components/ui/button'
import { type InertiaProps } from '~/types'

export default function VerifyEmail({ user }: InertiaProps) {
  return (
    <>
      <Head title="Confirme ton adresse" />
      <AuthShell
        title="Confirme ton adresse"
        footer={
          <Form route="session.destroy">
            <button type="submit" className="font-medium text-primary hover:underline">
              Se déconnecter
            </button>
          </Form>
        }
      >
        <p className="text-sm">
          Un e-mail contenant un lien de confirmation a été envoyé à <strong>{user?.email}</strong>.
          Ouvre-le pour activer ton compte.
        </p>
        <Form route="verification.resend" className="mt-6">
          {({ processing }) => (
            <Button
              type="submit"
              variant="outline"
              size="lg"
              disabled={processing}
              className="w-full"
            >
              Renvoyer l'e-mail
            </Button>
          )}
        </Form>
      </AuthShell>
    </>
  )
}

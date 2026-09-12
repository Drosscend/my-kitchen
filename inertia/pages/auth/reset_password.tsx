import { Form, Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { AuthShell } from '~/components/auth_shell'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ token: string }>

export default function ResetPassword({ token }: PageProps) {
  return (
    <>
      <Head title="Nouveau mot de passe" />
      <AuthShell
        title="Nouveau mot de passe"
        footer={
          <Link route="session.create" className="font-medium text-primary hover:underline">
            Retour à la connexion
          </Link>
        }
      >
        <Form route="password.update">
          {({ errors, processing }) => (
            <FieldGroup>
              <input type="hidden" name="token" value={token} />

              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="password">
                  Nouveau mot de passe (8 caractères minimum)
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="passwordConfirmation">Confirmer le mot de passe</FieldLabel>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  name="passwordConfirmation"
                  autoComplete="new-password"
                  required
                />
              </Field>

              <Button type="submit" size="lg" disabled={processing} className="w-full">
                Enregistrer le mot de passe
              </Button>
            </FieldGroup>
          )}
        </Form>
      </AuthShell>
    </>
  )
}

import { Form, Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { AuthShell } from '~/components/auth_shell'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

export default function ForgotPassword() {
  return (
    <>
      <Head title="Mot de passe oublié" />
      <AuthShell
        title="Mot de passe oublié"
        footer={
          <Link route="session.create" className="font-medium text-primary hover:underline">
            Retour à la connexion
          </Link>
        }
      >
        <Form route="password.email">
          {({ errors, processing }) => (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Adresse e-mail du compte</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Button type="submit" size="lg" disabled={processing} className="w-full">
                Envoyer le lien de réinitialisation
              </Button>
            </FieldGroup>
          )}
        </Form>
      </AuthShell>
    </>
  )
}

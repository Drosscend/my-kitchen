import { Form, Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { AuthShell } from '~/components/auth_shell'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

export default function Login() {
  return (
    <>
      <Head title="Connexion" />
      <AuthShell
        title="Connexion"
        footer={
          <>
            Pas encore de compte ?{' '}
            <Link route="new_account.create" className="font-medium text-primary hover:underline">
              Créer un compte
            </Link>
          </>
        }
      >
        <Form route="session.store">
          {({ errors, processing }) => (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>

              <Button type="submit" size="lg" disabled={processing} className="w-full">
                Se connecter
              </Button>
            </FieldGroup>
          )}
        </Form>
      </AuthShell>
    </>
  )
}

import { Form, Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { AuthShell } from '~/components/auth_shell'
import { GoogleSignIn } from '~/components/google_sign_in'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  googleSignIn: boolean
}>

export default function Login({ googleSignIn }: PageProps) {
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
        {googleSignIn && <GoogleSignIn />}
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

              <Link
                route="password.forgot"
                className="text-center text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </FieldGroup>
          )}
        </Form>
      </AuthShell>
    </>
  )
}

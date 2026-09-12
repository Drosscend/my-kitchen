import { Form, Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { AuthShell } from '~/components/auth_shell'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

export default function Signup() {
  return (
    <>
      <Head title="Créer un compte" />
      <AuthShell
        title="Créer un compte"
        footer={
          <>
            Déjà un compte ?{' '}
            <Link route="session.create" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </>
        }
      >
        <Form route="new_account.store">
          {({ errors, processing }) => (
            <FieldGroup>
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="name">Prénom</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
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

              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="password">Mot de passe (8 caractères minimum)</FieldLabel>
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
                  aria-invalid={Boolean(errors.password)}
                />
              </Field>

              <Button type="submit" size="lg" disabled={processing} className="w-full">
                Créer mon compte
              </Button>
            </FieldGroup>
          )}
        </Form>
      </AuthShell>
    </>
  )
}

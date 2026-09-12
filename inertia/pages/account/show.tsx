import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { type ReactNode } from 'react'
import { type Data } from '@generated/data'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ account: Data.Identity.AccountDetails }>

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="kraft-card rounded-lg p-6">
      <h2 className="kraft-title mb-4 text-2xl font-bold text-primary">{title}</h2>
      {children}
    </section>
  )
}

export default function ShowAccount({ account }: PageProps) {
  return (
    <>
      <Head title="Mon compte" />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-10 sm:px-6">
        <h1 className="kraft-title text-3xl font-bold text-primary">Mon compte</h1>

        <Section title="Profil">
          <Form route="account.profile.update" errorBag="profile">
            {({ errors, processing }) => (
              <FieldGroup>
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="name">Prénom</FieldLabel>
                  <Input id="name" name="name" defaultValue={account.name ?? ''} />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>
                <Button type="submit" disabled={processing} className="w-fit">
                  Enregistrer
                </Button>
              </FieldGroup>
            )}
          </Form>
        </Section>

        <Section title="Adresse e-mail">
          <p className="mb-4 text-sm">
            Adresse actuelle : <strong className="break-all">{account.email}</strong>
          </p>
          <Form route="account.email.update" errorBag="email">
            {({ errors, processing }) => (
              <FieldGroup>
                <Field data-invalid={Boolean(errors.email)}>
                  <FieldLabel htmlFor="new-email">Nouvelle adresse e-mail</FieldLabel>
                  <Input id="new-email" type="email" name="email" autoComplete="email" required />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>
                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="email-password">Mot de passe actuel</FieldLabel>
                  <Input
                    id="email-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                  />
                  {errors.password && <FieldError>{errors.password}</FieldError>}
                </Field>
                <Button type="submit" disabled={processing} className="w-fit">
                  Envoyer le lien de confirmation
                </Button>
              </FieldGroup>
            )}
          </Form>
        </Section>

        <Section title="Mot de passe">
          <Form route="account.password.update" errorBag="password">
            {({ errors, processing }) => (
              <FieldGroup>
                <Field data-invalid={Boolean(errors.currentPassword)}>
                  <FieldLabel htmlFor="current-password">Mot de passe actuel</FieldLabel>
                  <Input
                    id="current-password"
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    required
                  />
                  {errors.currentPassword && <FieldError>{errors.currentPassword}</FieldError>}
                </Field>
                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="new-password">
                    Nouveau mot de passe (8 caractères minimum)
                  </FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    required
                  />
                  {errors.password && <FieldError>{errors.password}</FieldError>}
                </Field>
                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="new-password-confirmation">
                    Confirmer le nouveau mot de passe
                  </FieldLabel>
                  <Input
                    id="new-password-confirmation"
                    type="password"
                    name="passwordConfirmation"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Button type="submit" disabled={processing} className="w-fit">
                  Modifier le mot de passe
                </Button>
              </FieldGroup>
            )}
          </Form>
        </Section>

        <Section title="Supprimer le compte">
          <p className="mb-4 text-sm text-muted-foreground">
            Le compte, son inventaire et ses recettes sont effacés immédiatement.
          </p>
          <Form route="account.destroy" errorBag="delete">
            {({ errors, processing }) => (
              <FieldGroup>
                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="delete-password">Mot de passe</FieldLabel>
                  <Input
                    id="delete-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                  />
                  {errors.password && <FieldError>{errors.password}</FieldError>}
                </Field>
                <Button type="submit" variant="destructive" disabled={processing} className="w-fit">
                  Supprimer mon compte
                </Button>
              </FieldGroup>
            )}
          </Form>
        </Section>
      </main>
    </>
  )
}

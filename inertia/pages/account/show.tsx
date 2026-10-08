import { Form, useRouter } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { cn } from 'cn'
import { PlugIcon, Trash2Icon } from 'lucide-react'
import { type ReactNode } from 'react'
import { type Data } from '@generated/data'
import { ConfirmDeleteDialog } from '~/components/confirm_delete_dialog'
import { CopyButton } from '~/components/copy_button'
import { Page, PageHeader } from '~/components/page'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  account: Data.Identity.AccountDetails
  oauthConnections: Data.Identity.OauthConnection[]
  mcpUrl: string
}>

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { dateStyle: 'medium' })
}

function Section({
  title,
  destructive,
  children,
}: {
  title: string
  destructive?: boolean
  children: ReactNode
}) {
  return (
    <section className="grid grid-cols-1 gap-4 border-t border-border/60 py-10 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <h2 className="kraft-title text-2xl font-bold text-primary">{title}</h2>
      <div
        className={cn(
          'kraft-card rounded-lg p-6 sm:p-8',
          destructive && 'ring-1 ring-destructive/30'
        )}
      >
        {children}
      </div>
    </section>
  )
}

function RevokeConnectionDialog({ connection }: { connection: Data.Identity.OauthConnection }) {
  const router = useRouter()
  const name = connection.clientName ?? 'cette application'

  return (
    <ConfirmDeleteDialog
      title="Révoquer cet accès ?"
      description={`${name} ne pourra plus appeler le serveur MCP sans une nouvelle autorisation.`}
      confirmLabel="Révoquer"
      onConfirm={() =>
        router.visit({
          route: 'account.oauth_connections.destroy',
          routeParams: { id: connection.id },
        })
      }
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Révoquer ${name}`}>
          <Trash2Icon className="text-muted-foreground" />
        </Button>
      }
    />
  )
}

export default function ShowAccount({ account, oauthConnections, mcpUrl }: PageProps) {
  return (
    <>
      <Head title="Mon compte" />
      <Page width="narrow">
        <PageHeader title="Mon compte" />

        <Section title="Profil">
          <Form route="account.profile.update" errorBag="profile">
            {({ errors, processing }) => (
              <FieldGroup className="max-w-md">
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="name">Prénom</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={account.name ?? ''}
                    aria-invalid={Boolean(errors.name)}
                  />
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
          <p className="mb-6 text-sm">
            Adresse actuelle : <strong className="break-all">{account.email}</strong>
          </p>
          <Form route="account.email.update" errorBag="email">
            {({ errors, processing }) => (
              <FieldGroup className="max-w-md">
                <Field data-invalid={Boolean(errors.email)}>
                  <FieldLabel htmlFor="new-email">Nouvelle adresse e-mail</FieldLabel>
                  <Input
                    id="new-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    aria-invalid={Boolean(errors.email)}
                  />
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
                    aria-invalid={Boolean(errors.password)}
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
              <FieldGroup className="max-w-md">
                <Field data-invalid={Boolean(errors.currentPassword)}>
                  <FieldLabel htmlFor="current-password">Mot de passe actuel</FieldLabel>
                  <Input
                    id="current-password"
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(errors.currentPassword)}
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
                    aria-invalid={Boolean(errors.password)}
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
                    aria-invalid={Boolean(errors.password)}
                  />
                </Field>
                <Button type="submit" disabled={processing} className="w-fit">
                  Modifier le mot de passe
                </Button>
              </FieldGroup>
            )}
          </Form>
        </Section>

        <Section title="Accès MCP">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium">Adresse du serveur</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md bg-paper-light px-3 py-2 font-mono text-sm">
                  {mcpUrl}
                </code>
                <CopyButton text={() => mcpUrl} label="Copier l'adresse" size="icon" iconOnly />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Ajoute cette adresse comme connecteur dans Claude ou ChatGPT : l'assistant t'enverra
              ici pour autoriser son accès.
            </p>

            {oauthConnections.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Applications connectées</p>
                <ul className="space-y-2">
                  {oauthConnections.map((connection) => (
                    <li
                      key={connection.id}
                      className="flex items-center justify-between gap-4 rounded-md bg-paper-light px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <PlugIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          {connection.clientName ?? 'Application inconnue'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Autorisée le {formatDate(connection.createdAt)}
                          {connection.lastUsedAt
                            ? `, utilisée le ${formatDate(connection.lastUsedAt)}`
                            : ', jamais utilisée'}
                        </p>
                      </div>
                      <RevokeConnectionDialog connection={connection} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>

        <Section title="Supprimer le compte" destructive>
          <p className="mb-6 text-sm text-muted-foreground">
            Le compte, son inventaire et ses recettes sont effacés immédiatement.
          </p>
          <Form route="account.destroy" errorBag="delete">
            {({ errors, processing }) => (
              <FieldGroup className="max-w-md">
                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="delete-password">Mot de passe</FieldLabel>
                  <Input
                    id="delete-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(errors.password)}
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
      </Page>
    </>
  )
}

import { Form, useRouter } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { KeyRoundIcon, Trash2Icon } from 'lucide-react'
import { type ReactNode } from 'react'
import { type Data } from '@generated/data'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  account: Data.Identity.AccountDetails
  mcpTokens: Data.Identity.McpToken[]
  mcpUrl: string
  newMcpToken: string | null
}>

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { dateStyle: 'medium' })
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="kraft-card rounded-lg p-6">
      <h2 className="kraft-title mb-4 text-2xl font-bold text-primary">{title}</h2>
      {children}
    </section>
  )
}

export default function ShowAccount({ account, mcpTokens, mcpUrl, newMcpToken }: PageProps) {
  const router = useRouter()

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

        <Section title="Accès MCP">
          <p className="mb-4 text-sm">
            Adresse du serveur :{' '}
            <code className="rounded bg-paper-light px-1.5 py-0.5">{mcpUrl}</code>
          </p>
          {newMcpToken && (
            <div className="mb-4 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
              <p className="mb-2 font-medium">
                Nouveau token, copie-le maintenant, il ne sera plus affiché :
              </p>
              <code className="block break-all rounded bg-paper-light px-2 py-1 font-mono text-xs">
                {newMcpToken}
              </code>
              <p className="mt-2 text-xs text-muted-foreground">
                À envoyer dans l’en-tête Authorization: Bearer {newMcpToken.slice(0, 11)}…
              </p>
            </div>
          )}
          {mcpTokens.length > 0 && (
            <ul className="mb-4 divide-y divide-border/60 text-sm">
              {mcpTokens.map((token) => (
                <li key={token.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="font-medium">
                      <KeyRoundIcon className="mr-1 inline size-3.5 text-muted-foreground" />
                      {token.name}{' '}
                      <span className="font-mono text-xs text-muted-foreground">
                        {token.prefix}…
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créé le {formatDate(token.createdAt)}
                      {token.lastUsedAt
                        ? `, utilisé le ${formatDate(token.lastUsedAt)}`
                        : ', jamais utilisé'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Révoquer ${token.name}`}
                    onClick={() =>
                      router.visit({
                        route: 'account.mcp_tokens.destroy',
                        routeParams: { id: token.id },
                      })
                    }
                  >
                    <Trash2Icon className="text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Form key={newMcpToken ?? 'empty'} route="account.mcp_tokens.store" errorBag="mcp">
            {({ errors, processing }) => (
              <FieldGroup>
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="mcp-token-name">
                    Nom du token (par exemple « Claude »)
                  </FieldLabel>
                  <Input id="mcp-token-name" name="name" required />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>
                <Button type="submit" disabled={processing} className="w-fit">
                  Créer un token
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

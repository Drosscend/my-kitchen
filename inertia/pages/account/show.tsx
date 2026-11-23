import { Form, useRouter } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import {
  BellOffIcon,
  BellPlusIcon,
  LockIcon,
  LogOutIcon,
  MonitorIcon,
  PlugIcon,
  SendIcon,
  ShareIcon,
  SmartphoneIcon,
  Trash2Icon,
} from 'lucide-react'
import { type ReactNode } from 'react'
import { type Data } from '@generated/data'
import { ConfirmDeleteDialog } from '~/components/confirm_delete_dialog'
import { ConnectorGuide } from '~/components/connector_guide'
import { Page, PageHeader } from '~/components/page'
import { Button } from '~/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { Switch } from '~/components/ui/switch'
import { usePushSubscription } from '~/notifications/use_push_subscription'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  account: Data.Identity.AccountDetails
  oauthConnections: Data.Identity.OauthConnection[]
  notifications: Data.Notifications.NotificationSettings
  pushDevices: Data.Notifications.PushDevice[]
  vapidPublicKey: string | null
  expiryWarnings: Data.Inventory.ExpiryWarning[]
  mcpUrl: string
  googleSignIn: boolean
}>

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { dateStyle: 'medium' })
}

function Group({
  id,
  title,
  destructive,
  children,
}: {
  id: string
  title: string
  destructive?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 space-y-4">
      <h2 id={`${id}-title`} className="text-lg">
        {title}
      </h2>
      <div
        data-destructive={destructive}
        className="rounded-xl border bg-card px-5 sm:px-6 data-destructive:border-destructive/40"
      >
        {children}
      </div>
    </section>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title?: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-5 border-t py-5 first:border-t-0 sm:py-6">
      {(title || description) && (
        <div className="space-y-1.5">
          {title && <h3 className="font-semibold">{title}</h3>}
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

function NotificationSettings({
  notifications,
  pushDevices,
  vapidPublicKey,
}: {
  notifications: Data.Notifications.NotificationSettings
  pushDevices: Data.Notifications.PushDevice[]
  vapidPublicKey: string | null
}) {
  const router = useRouter()
  const push = usePushSubscription()
  const hasDevice = pushDevices.length > 0
  const thisDeviceAdded = pushDevices.some((device) => device.endpoint === push.endpoint)

  function update(changes: Partial<Data.Notifications.NotificationSettings>) {
    router.visit(
      { route: 'account.notifications.update' },
      { preserveScroll: true, preserveState: true, data: changes }
    )
  }

  async function addThisDevice(publicKey: string) {
    const subscription = await push.subscribe(publicKey)

    if (subscription) {
      router.visit(
        { route: 'account.push_devices.store' },
        { preserveScroll: true, preserveState: true, data: subscription }
      )
    }
  }

  async function removeDevice(device: Data.Notifications.PushDevice) {
    if (device.endpoint === push.endpoint) {
      await push.unsubscribe()
    }

    router.visit(
      { route: 'account.push_devices.destroy', routeParams: { id: device.id } },
      { preserveScroll: true, preserveState: true }
    )
  }

  return (
    <div className="space-y-6">
      <div
        data-push={vapidPublicKey !== null}
        className="[--notification-columns:minmax(0,1fr)_4.5rem] data-[push=true]:[--notification-columns:minmax(0,1fr)_4.5rem_4.5rem]"
      >
        <div className="grid grid-cols-(--notification-columns) pb-1 text-center text-xs font-medium text-muted-foreground">
          <span className="sr-only">Alerte</span>
          <span className="col-start-2">E-mail</span>
          {vapidPublicKey && <span>Push</span>}
        </div>
        <div className="grid min-h-12 grid-cols-(--notification-columns) items-center">
          <span className="text-sm font-medium">Péremption</span>
          <div className="flex justify-center">
            <Switch
              aria-label="Péremption par e-mail"
              checked={notifications.expiryMail}
              onCheckedChange={(expiryMail) => update({ expiryMail })}
            />
          </div>
          {vapidPublicKey && (
            <div className="flex justify-center">
              <Switch
                aria-label="Péremption en push"
                checked={hasDevice && notifications.expiryPush}
                disabled={!hasDevice}
                onCheckedChange={(expiryPush) => update({ expiryPush })}
              />
            </div>
          )}
        </div>
        <div className="grid min-h-12 grid-cols-(--notification-columns) items-center border-t">
          <span className="text-sm font-medium">Sécurité du compte</span>
          <div className="flex items-center justify-center gap-1.5 pl-5">
            <Switch aria-label="Sécurité du compte par e-mail, toujours envoyé" checked disabled />
            <LockIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
          </div>
          {vapidPublicKey && (
            <div className="flex justify-center">
              <Switch
                aria-label="Sécurité du compte en push"
                checked={hasDevice && notifications.securityPush}
                disabled={!hasDevice}
                onCheckedChange={(securityPush) => update({ securityPush })}
              />
            </div>
          )}
        </div>
      </div>

      {vapidPublicKey && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Appareils</p>
          {hasDevice ? (
            <ul className="space-y-2">
              {pushDevices.map((device) => (
                <li
                  key={device.id}
                  className="flex items-center justify-between gap-4 rounded-md bg-muted py-2 pr-2 pl-4"
                >
                  <div className="min-w-0">
                    <p className="flex items-start gap-2 text-sm font-medium">
                      {/iPhone|iPad|Android/.test(device.label) ? (
                        <SmartphoneIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <MonitorIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span>
                        {device.label}
                        {device.endpoint === push.endpoint && (
                          <span className="ml-2 inline-block rounded-sm bg-card px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                            Cet appareil
                          </span>
                        )}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ajouté le {formatDate(device.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.visit(
                          { route: 'account.push_devices.test', routeParams: { id: device.id } },
                          { preserveScroll: true, preserveState: true }
                        )
                      }
                    >
                      <SendIcon />
                      Tester
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Retirer ${device.label}`}
                      onClick={() => removeDevice(device)}
                    >
                      <Trash2Icon className="text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun appareil</p>
          )}

          {push.support === 'blocked' && (
            <p className="flex gap-2.5 rounded-md bg-muted px-4 py-3 text-sm">
              <BellOffIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                <strong className="font-semibold">
                  Notifications bloquées dans ce navigateur.
                </strong>{' '}
                Autorise-les dans les réglages du site, puis recharge la page.
              </span>
            </p>
          )}
          {push.support === 'install_app' && (
            <p className="flex gap-2.5 rounded-md bg-muted px-4 py-3 text-sm">
              <ShareIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                <strong className="font-semibold">Sur iPhone, installe d'abord l'app :</strong>{' '}
                Partager, puis « Sur l'écran d'accueil ». Ouvre-la depuis l'icône pour ajouter cet
                appareil.
              </span>
            </p>
          )}
          {push.support === 'available' && !thisDeviceAdded && (
            <Button variant="outline" onClick={() => addThisDevice(vapidPublicKey)}>
              <BellPlusIcon />
              Ajouter cet appareil
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function ExpiryWarningSettings({ warnings }: { warnings: Data.Inventory.ExpiryWarning[] }) {
  const router = useRouter()
  const customized = warnings.some(
    (warning) => warning.custom.perishable !== null || warning.custom.shelfStable !== null
  )

  return (
    <Form
      key={warnings
        .map((warning) => `${warning.custom.perishable}:${warning.custom.shelfStable}`)
        .join('|')}
      route="account.expiry_warnings.update"
      errorBag="expiryWarnings"
      options={{ preserveScroll: true }}
      className="space-y-6"
    >
      {({ errors, processing }) => (
        <>
          <div className="[--warning-columns:minmax(0,1fr)_5.5rem_5.5rem]">
            <div className="grid grid-cols-(--warning-columns) gap-3 pb-1 text-center text-xs font-medium text-muted-foreground">
              <span className="sr-only">Catégorie</span>
              <span className="col-start-2">Se gâte</span>
              <span>Longue conservation</span>
            </div>
            {warnings.map((warning, index) => (
              <div
                key={warning.category}
                className="grid min-h-12 grid-cols-(--warning-columns) items-center gap-3 border-t first-of-type:border-t-0"
              >
                <input
                  type="hidden"
                  name={`warnings[${index}][category]`}
                  value={warning.category}
                />
                <span className="text-sm font-medium">{warning.categoryLabel}</span>
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    min={0}
                    max={365}
                    name={`warnings[${index}][perishable]`}
                    defaultValue={warning.custom.perishable ?? ''}
                    placeholder={String(warning.defaults.perishable)}
                    aria-label={`${warning.categoryLabel}, produit qui se gâte, jours avant la date`}
                    aria-invalid={Boolean(errors[`warnings.${index}.perishable`])}
                    className="text-right tabular-nums"
                  />
                  <InputGroupAddon align="inline-end">j</InputGroupAddon>
                </InputGroup>
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    min={0}
                    max={365}
                    name={`warnings[${index}][shelfStable]`}
                    defaultValue={warning.custom.shelfStable ?? ''}
                    placeholder={String(warning.defaults.shelfStable)}
                    aria-label={`${warning.categoryLabel}, longue conservation, jours avant la date`}
                    aria-invalid={Boolean(errors[`warnings.${index}.shelfStable`])}
                    className="text-right tabular-nums"
                  />
                  <InputGroupAddon align="inline-end">j</InputGroupAddon>
                </InputGroup>
              </div>
            ))}
          </div>
          {Object.keys(errors).length > 0 && (
            <FieldError>Un délai est un nombre entier de jours, entre 0 et 365.</FieldError>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={processing}>
              Enregistrer
            </Button>
            {customized && (
              <Button
                type="button"
                variant="outline"
                disabled={processing}
                onClick={() =>
                  router.visit(
                    { route: 'account.expiry_warnings.update' },
                    { preserveScroll: true, data: { warnings: [] } }
                  )
                }
              >
                Remettre par défaut
              </Button>
            )}
          </div>
        </>
      )}
    </Form>
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
        <Button variant="ghost" size="icon" aria-label={`Révoquer ${name}`}>
          <Trash2Icon className="text-muted-foreground" />
        </Button>
      }
    />
  )
}

export default function ShowAccount({
  account,
  oauthConnections,
  notifications,
  pushDevices,
  vapidPublicKey,
  expiryWarnings,
  mcpUrl,
  googleSignIn,
}: PageProps) {
  return (
    <>
      <Head title="Mon compte" />
      <Page>
        <PageHeader
          title="Mon compte"
          actions={
            <Form route="session.destroy">
              <Button type="submit" variant="outline" size="lg">
                <LogOutIcon data-icon="inline-start" />
                Se déconnecter
              </Button>
            </Form>
          }
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-14">
          <div className="min-w-0 space-y-12">
            <Group id="profile" title="Profil">
              <Section>
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
                      {account.hasPassword && (
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
                      )}
                      <Button type="submit" disabled={processing} className="w-fit">
                        Envoyer le lien de confirmation
                      </Button>
                    </FieldGroup>
                  )}
                </Form>
              </Section>

              {(googleSignIn || account.googleLinked) && (
                <Section title="Connexion Google">
                  <p className="text-sm">
                    {account.googleLinked
                      ? 'Ton compte est lié à Google : « Continuer avec Google » te connecte directement.'
                      : 'Pour lier ton compte, déconnecte-toi puis choisis « Continuer avec Google » avec un compte Google qui utilise la même adresse.'}
                  </p>
                </Section>
              )}
            </Group>

            <Group id="security" title="Sécurité">
              <Section title="Mot de passe">
                {!account.hasPassword && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    Ton compte n'a pas encore de mot de passe. Définis-en un pour pouvoir aussi te
                    connecter avec ton adresse e-mail.
                  </p>
                )}
                <Form route="account.password.update" errorBag="password">
                  {({ errors, processing }) => (
                    <FieldGroup className="max-w-md">
                      {account.hasPassword && (
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
                          {errors.currentPassword && (
                            <FieldError>{errors.currentPassword}</FieldError>
                          )}
                        </Field>
                      )}
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
                      <Field data-invalid={Boolean(errors.passwordConfirmation)}>
                        <FieldLabel htmlFor="new-password-confirmation">
                          Confirmer le nouveau mot de passe
                        </FieldLabel>
                        <Input
                          id="new-password-confirmation"
                          type="password"
                          name="passwordConfirmation"
                          autoComplete="new-password"
                          required
                          aria-invalid={Boolean(errors.passwordConfirmation)}
                        />
                        {errors.passwordConfirmation && (
                          <FieldError>{errors.passwordConfirmation}</FieldError>
                        )}
                      </Field>
                      <Button type="submit" disabled={processing} className="w-fit">
                        {account.hasPassword
                          ? 'Modifier le mot de passe'
                          : 'Définir le mot de passe'}
                      </Button>
                    </FieldGroup>
                  )}
                </Form>
              </Section>
            </Group>

            <Group id="notifications" title="Notifications">
              <Section
                title="Canaux"
                description="Le point du matin, envoyé à 8 h, liste les produits proches de leur date. Les alertes de sécurité signalent toute modification sensible du compte."
              >
                <NotificationSettings
                  notifications={notifications}
                  pushDevices={pushDevices}
                  vapidPublicKey={vapidPublicKey}
                />
              </Section>

              <Section
                title="Alertes de péremption"
                description="Nombre de jours avant la date à partir duquel un produit est signalé. « Se gâte » s'applique aux produits frais et aux DLC, « Longue conservation » aux DDM des produits qui se gardent."
              >
                <ExpiryWarningSettings warnings={expiryWarnings} />
              </Section>
            </Group>

            <Group id="assistants" title="Assistants">
              <Section title="Accès MCP">
                <div className="space-y-8">
                  <ConnectorGuide mcpUrl={mcpUrl} embedded />

                  {oauthConnections.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Applications connectées</p>
                      <ul className="space-y-2">
                        {oauthConnections.map((connection) => (
                          <li
                            key={connection.id}
                            className="flex items-center justify-between gap-4 rounded-md bg-muted px-4 py-3"
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
            </Group>

            <Group id="delete-account" title="Supprimer le compte" destructive>
              <Section description="Le compte, son inventaire et ses recettes sont effacés immédiatement.">
                <Form route="account.destroy" errorBag="delete">
                  {({ errors, processing }) => (
                    <FieldGroup className="max-w-md">
                      {account.hasPassword ? (
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
                      ) : (
                        <Field data-invalid={Boolean(errors.email)}>
                          <FieldLabel htmlFor="delete-email">
                            Tape l'adresse e-mail du compte pour confirmer
                          </FieldLabel>
                          <Input
                            id="delete-email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            required
                            aria-invalid={Boolean(errors.email)}
                          />
                          {errors.email && <FieldError>{errors.email}</FieldError>}
                        </Field>
                      )}
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={processing}
                        className="w-fit"
                      >
                        Supprimer mon compte
                      </Button>
                    </FieldGroup>
                  )}
                </Form>
              </Section>
            </Group>
          </div>

          <nav aria-label="Sommaire" className="hidden lg:block">
            <ul className="sticky top-6 space-y-1 border-l text-sm">
              {[
                ['profile', 'Profil'],
                ['security', 'Sécurité'],
                ['notifications', 'Notifications'],
                ['assistants', 'Assistants'],
                ['delete-account', 'Supprimer le compte'],
              ].map(([id, title]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="-ml-px block border-l border-transparent py-1 pl-4 text-muted-foreground hover:border-foreground hover:text-foreground"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Page>
    </>
  )
}

import { Head } from '@inertiajs/react'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ account: Data.Identity.AccountDetails }>

export default function ShowAccount({ account }: PageProps) {
  return (
    <>
      <Head title="Mon compte" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="kraft-title mb-6 text-3xl font-bold text-primary">Mon compte</h1>
        <section className="kraft-card rounded-lg p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Prénom</dt>
              <dd className="mt-1 font-medium">{account.name ?? 'Non renseigné'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Adresse e-mail</dt>
              <dd className="mt-1 font-medium break-all">{account.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Membre depuis</dt>
              <dd className="mt-1 font-medium">
                {new Date(account.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </>
  )
}

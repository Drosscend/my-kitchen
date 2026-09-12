import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import { type InertiaProps } from '~/types'

export default function Home({ user }: InertiaProps) {
  return (
    <>
      <Head title="Accueil" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="kraft-title text-5xl font-bold text-primary">Mon Garde-Manger</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Inventaire de cuisine, recettes et mode cuisine partagé.
        </p>
        <div className="mt-8 flex gap-2">
          {user ? (
            <Button size="lg" nativeButton={false} render={<Link route="account.show" />}>
              Mon compte
            </Button>
          ) : (
            <>
              <Button size="lg" nativeButton={false} render={<Link route="new_account.create" />}>
                Créer un compte
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link route="session.create" />}>
                Se connecter
              </Button>
            </>
          )}
        </div>
      </main>
    </>
  )
}

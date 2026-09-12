import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { ClipboardListIcon, CookingPotIcon, LogOutIcon, UserRoundIcon } from 'lucide-react'
import { type ReactElement, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/sonner'

export default function Layout({ children }: { children: ReactElement }) {
  const { url, flash, props } = usePage()

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (flash.error) {
      toast.error(flash.error)
    }

    if (flash.success) {
      toast.success(flash.success)
    }
  })

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border/60 bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            route="inventory.index"
            className="kraft-title flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <img src="/logo.svg" alt="" className="size-8" />
            Mon Garde-Manger
          </Link>

          <nav className="flex items-center gap-1" aria-label="Navigation">
            {props.user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link route="inventory.index" />}
                >
                  <ClipboardListIcon data-icon="inline-start" />
                  Inventaire
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link route="recipes.index" />}
                >
                  <CookingPotIcon data-icon="inline-start" />
                  Recettes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link route="account.show" />}
                >
                  <UserRoundIcon data-icon="inline-start" />
                  Mon compte
                </Button>
                <Form route="session.destroy">
                  <Button type="submit" variant="ghost" size="sm">
                    <LogOutIcon data-icon="inline-start" />
                    Se déconnecter
                  </Button>
                </Form>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link route="session.create" />}
                >
                  Se connecter
                </Button>
                <Button size="sm" nativeButton={false} render={<Link route="new_account.create" />}>
                  Créer un compte
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <Toaster position="top-center" />
    </div>
  )
}

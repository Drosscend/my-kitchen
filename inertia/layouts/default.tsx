import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { cn } from 'cn'
import { ClipboardListIcon, CookingPotIcon, LogOutIcon, UserRoundIcon } from 'lucide-react'
import { type ReactElement, type ReactNode, useEffect } from 'react'
import { toast } from 'sonner'
import { CONTAINER } from '~/components/page'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/sonner'

type Route = 'inventory.index' | 'recipes.index' | 'account.show'

function NavLink({ route, path, children }: { route: Route; path: string; children: ReactNode }) {
  const { url } = usePage()
  const active = path === '/' ? url === '/' : url.startsWith(path)

  return (
    <Button
      variant="ghost"
      nativeButton={false}
      className={cn('gap-1.5 px-2 sm:px-3', active && 'bg-paper-light text-foreground')}
      render={<Link route={route} aria-current={active ? 'page' : undefined} />}
    >
      {children}
    </Button>
  )
}

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
        <div className={cn(CONTAINER, 'flex h-16 items-center justify-between gap-6')}>
          <Link
            route="inventory.index"
            className="kraft-title flex shrink-0 items-center gap-2.5 text-2xl font-bold whitespace-nowrap text-primary"
          >
            <img src="/logo.svg" alt="" className="size-9" />
            <span className="hidden sm:inline">Mon Garde-Manger</span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Navigation">
            {props.user ? (
              <>
                <NavLink route="inventory.index" path="/">
                  <ClipboardListIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Inventaire</span>
                </NavLink>
                <NavLink route="recipes.index" path="/recipes">
                  <CookingPotIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Recettes</span>
                </NavLink>
                <NavLink route="account.show" path="/account">
                  <UserRoundIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Mon compte</span>
                </NavLink>
                <Form route="session.destroy" className="ml-2 border-l border-border/60 pl-3">
                  <Button type="submit" variant="ghost" className="gap-1.5 px-2 sm:px-3">
                    <LogOutIcon data-icon="inline-start" />
                    <span className="hidden sm:inline">Se déconnecter</span>
                  </Button>
                </Form>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  nativeButton={false}
                  className="px-3"
                  render={<Link route="session.create" />}
                >
                  Se connecter
                </Button>
                <Button
                  nativeButton={false}
                  className="px-3"
                  render={<Link route="new_account.create" />}
                >
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

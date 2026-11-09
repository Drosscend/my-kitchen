import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { cn } from 'cn'
import { BookOpenIcon, CircleUserRoundIcon, type LucideIcon, ShelvingUnitIcon } from 'lucide-react'
import { type ReactElement, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/sonner'
import { type Swatch } from '~/swatch'

type Route = 'inventory.index' | 'recipes.index' | 'account.show'

const SECTIONS: {
  route: Route
  path: string
  label: string
  icon: LucideIcon
  swatch: Swatch
}[] = [
  {
    route: 'inventory.index',
    path: '/',
    label: 'Inventaire',
    icon: ShelvingUnitIcon,
    swatch: 'mustard',
  },
  {
    route: 'recipes.index',
    path: '/recipes',
    label: 'Recettes',
    icon: BookOpenIcon,
    swatch: 'tomato',
  },
  {
    route: 'account.show',
    path: '/account',
    label: 'Compte',
    icon: CircleUserRoundIcon,
    swatch: 'sage',
  },
]

/**
 * Read once when the bundle loads, which is enough for a copyright line.
 */
const CURRENT_YEAR = new Date().getFullYear()

function isActive(url: string, path: string) {
  return path === '/' ? url === '/' : url.startsWith(path)
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
  }, [flash])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-card pt-[env(safe-area-inset-top)]">
        <div className="page-width flex h-14 items-center justify-between gap-6 md:h-15">
          <Link
            route="inventory.index"
            className="flex shrink-0 items-center gap-2.5 text-lg font-extrabold tracking-tight font-stretch-[88%]"
          >
            <img src="/logo.svg" alt="" className="size-8" />
            Mon Garde-Manger
          </Link>

          {props.user ? (
            <nav aria-label="Navigation" className="hidden gap-1 self-end md:flex">
              {SECTIONS.map(({ route, path, label, swatch }) => {
                const active = isActive(url, path)

                return (
                  <Link
                    key={route}
                    route={route}
                    aria-current={active ? 'page' : undefined}
                    data-swatch={swatch}
                    className={cn(
                      'relative -mb-px flex h-10.5 items-center rounded-t-lg px-4.5 text-sm font-semibold text-muted-foreground transition-colors before:absolute before:inset-x-2 before:top-0 before:h-1 before:rounded-b-sm before:bg-(--swatch) hover:text-foreground',
                      active &&
                        'bg-(--swatch) text-foreground shadow-[inset_0_-1px_0_rgb(41_35_30/0.15)] before:hidden'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                nativeButton={false}
                className="max-sm:hidden"
                render={<Link route="session.create" />}
              >
                Se connecter
              </Button>
              <Button nativeButton={false} render={<Link route="new_account.create" />}>
                Créer un compte
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      {/* Signed-in phones keep the footer clear of the fixed tab bar. */}
      <footer
        data-tabs={props.user ? '' : undefined}
        className="border-t py-5 data-tabs:max-md:pb-[calc(5.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="page-width flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            © {CURRENT_YEAR}{' '}
            <a href="https://kevin-dev.com" className="hover:text-foreground hover:underline">
              Kévin Véronési
            </a>
          </span>
          <Link route="legal.show" className="hover:text-foreground hover:underline">
            Mentions légales
          </Link>
        </div>
      </footer>

      {props.user && (
        <nav
          aria-label="Navigation"
          className="fixed inset-x-0 bottom-0 isolate z-40 grid grid-cols-3 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {SECTIONS.map(({ route, path, label, icon: Icon, swatch }) => {
            const active = isActive(url, path)

            return (
              <Link
                key={route}
                route={route}
                aria-current={active ? 'page' : undefined}
                data-swatch={swatch}
                className={cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-muted-foreground before:absolute before:top-0 before:left-1/2 before:h-1 before:w-8 before:-translate-x-1/2 before:rounded-b-sm before:bg-(--swatch)',
                  active &&
                    'text-foreground before:hidden after:absolute after:inset-x-3 after:-top-2 after:bottom-1.5 after:-z-10 after:rounded-t-xl after:rounded-b-md after:bg-(--swatch) after:shadow-[0_-2px_6px_-3px_rgb(41_35_30/0.3)]'
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </Link>
            )
          })}
        </nav>
      )}

      <Toaster position="top-center" />
    </div>
  )
}

import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'

interface ErrorPageProps {
  status: '404' | '500'
  title: string
}

export function ErrorPage({ status, title }: ErrorPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="kraft-title text-7xl font-bold text-primary">{status}</p>
      <h1 className="mt-4 text-lg font-medium">{title}</h1>
      <Button className="mt-8" nativeButton={false} render={<Link route="home" />}>
        Retour à l'accueil
      </Button>
    </main>
  )
}

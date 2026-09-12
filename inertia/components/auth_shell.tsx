import { type ReactNode } from 'react'

interface AuthShellProps {
  title: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:px-8">
      <img src="/logo.svg" alt="" className="mb-6 size-16" />
      <section className="kraft-card rounded-lg p-6 sm:p-8">
        <h1 className="kraft-title mb-6 text-3xl font-bold text-primary">{title}</h1>
        {children}
        <p className="mt-6 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
          {footer}
        </p>
      </section>
    </main>
  )
}

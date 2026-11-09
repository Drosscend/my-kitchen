import { type ReactNode } from 'react'

interface AuthShellProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <section className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">
        <h1 className="mb-6 text-2xl">{title}</h1>
        {children}
        {footer && (
          <div className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </section>
    </main>
  )
}

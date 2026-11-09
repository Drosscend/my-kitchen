import { type ReactNode } from 'react'

export function Page({ children }: { children: ReactNode }) {
  return <main className="page-width flex-1 pt-6 pb-12 sm:pt-8">{children}</main>
}

interface PageHeaderProps {
  title: string
  meta?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, meta, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mb-8">
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="text-4xl leading-none sm:text-[44px]">{title}</h1>
        {meta && <span className="text-sm text-muted-foreground tabular-nums">{meta}</span>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

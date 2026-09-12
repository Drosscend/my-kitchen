import { cn } from 'cn'
import { type ReactNode } from 'react'

export const CONTAINER = 'w-full px-5 sm:px-8 lg:px-12 2xl:px-16'

interface PageProps {
  children: ReactNode
  width?: 'wide' | 'narrow'
}

export function Page({ children, width = 'wide' }: PageProps) {
  return (
    <main
      className={cn(CONTAINER, 'flex-1 py-8 lg:py-12', width === 'narrow' && 'mx-auto max-w-5xl')}
    >
      {children}
    </main>
  )
}

interface PageHeaderProps {
  title: string
  actions?: ReactNode
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-10">
      <h1 className="kraft-title text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

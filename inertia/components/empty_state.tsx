import { cn } from 'cn'
import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  children: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-20 text-center text-muted-foreground',
        className
      )}
    >
      <Icon className="size-10 opacity-60" />
      <p className="text-sm">{children}</p>
    </div>
  )
}

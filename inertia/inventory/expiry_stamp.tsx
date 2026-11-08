import { cn } from 'cn'
import { type Batch } from '~/inventory/catalog'
import { expiryLabel } from '~/inventory/expiry'

function tone({ expiryStatus, expiresOn }: Pick<Batch, 'expiryStatus' | 'expiresOn'>) {
  if (expiresOn === null) {
    return 'none'
  }

  return expiryStatus === 'none' ? 'ok' : expiryStatus
}

type ExpiryStampProps = Pick<Batch, 'expiryStatus' | 'expiresOn' | 'daysLeft'> & {
  className?: string
}

export function ExpiryStamp({ className, ...expiry }: ExpiryStampProps) {
  return (
    <span
      data-tone={tone(expiry)}
      className={cn(
        'inline-flex h-6 shrink-0 items-center rounded-sm border-[1.5px] bg-[var(--stamp-bg,var(--color-card))] px-1.75 text-xs font-bold tracking-[0.01em] whitespace-nowrap tabular-nums shadow-[inset_0_0_0_1.5px_var(--stamp-bg,var(--color-card)),inset_0_0_0_2.4px_color-mix(in_srgb,currentColor_38%,transparent)] font-stretch-75%',
        'data-[tone=expired]:border-destructive data-[tone=expired]:text-destructive data-[tone=expired]:[--stamp-bg:var(--color-note-expired)]',
        'data-[tone=soon]:border-warning data-[tone=soon]:text-warning-foreground data-[tone=soon]:[--stamp-bg:var(--color-note-soon)]',
        'data-[tone=check]:border-dashed data-[tone=check]:border-warning data-[tone=check]:text-warning-foreground data-[tone=check]:shadow-none',
        'data-[tone=ok]:border-sage data-[tone=ok]:text-sage-foreground data-[tone=ok]:[--stamp-bg:var(--color-note-ok)]',
        'data-[tone=none]:border-transparent data-[tone=none]:bg-transparent data-[tone=none]:px-0 data-[tone=none]:font-medium data-[tone=none]:text-muted-foreground data-[tone=none]:shadow-none',
        className
      )}
    >
      {expiryLabel(expiry)}
    </span>
  )
}

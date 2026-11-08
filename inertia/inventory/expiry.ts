import { type Batch } from '~/inventory/catalog'

type BadgeVariant = 'destructive' | 'warning' | 'outline'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

export function formatExpiryDate(expiresOn: string) {
  return dateFormat.format(new Date(`${expiresOn}T12:00:00`))
}

/**
 * What a row says about its most urgent batch, and how loudly.
 */
export function expiryBadge({
  expiryStatus,
  expiresOn,
  daysLeft,
}: Pick<Batch, 'expiryStatus' | 'expiresOn' | 'daysLeft'>): {
  label: string
  variant: BadgeVariant | null
} | null {
  if (expiresOn === null || daysLeft === null) {
    return null
  }

  switch (expiryStatus) {
    case 'expired':
      return { label: 'Périmé', variant: 'destructive' }
    case 'check':
      return { label: 'DDM dépassée', variant: 'outline' }
    case 'soon':
      return {
        label: daysLeft === 0 ? "Aujourd'hui" : daysLeft === 1 ? 'Demain' : `Dans ${daysLeft} j`,
        variant: 'warning',
      }
    default:
      return { label: formatExpiryDate(expiresOn), variant: null }
  }
}

export function isExpiringSoon(expiryStatus: Batch['expiryStatus']) {
  return expiryStatus === 'expired' || expiryStatus === 'soon' || expiryStatus === 'check'
}

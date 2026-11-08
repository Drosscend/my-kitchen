import { type Batch } from '~/inventory/catalog'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

function formatExpiryDate(expiresOn: string) {
  return dateFormat.format(new Date(`${expiresOn}T12:00:00`))
}

/**
 * What a row says about its most urgent batch.
 */
export function expiryLabel({
  expiryStatus,
  expiresOn,
  daysLeft,
}: Pick<Batch, 'expiryStatus' | 'expiresOn' | 'daysLeft'>) {
  if (expiresOn === null || daysLeft === null) {
    return 'Sans date'
  }

  switch (expiryStatus) {
    case 'expired':
      return 'Périmé'
    case 'check':
      return 'À vérifier'
    case 'soon':
      return daysLeft === 0 ? "Aujourd'hui" : daysLeft === 1 ? 'Demain' : `Dans ${daysLeft} j`
    default:
      return formatExpiryDate(expiresOn)
  }
}

export function isExpiringSoon(expiryStatus: Batch['expiryStatus']) {
  return expiryStatus === 'expired' || expiryStatus === 'soon' || expiryStatus === 'check'
}

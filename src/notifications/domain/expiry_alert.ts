import type { ExpiryKind, IngredientUnit } from '#inventory/domain/catalog'

/**
 * From the most to the least urgent, the order of the digest.
 */
export const EXPIRY_ALERT_STATUSES = ['expired', 'soon', 'check'] as const

export type ExpiryAlertStatus = (typeof EXPIRY_ALERT_STATUSES)[number]

export interface ExpiryAlert {
  batchId: string
  ingredientName: string
  quantity: number
  unit: IngredientUnit
  status: ExpiryAlertStatus
  expiresOn: string
  expiryKind: ExpiryKind
  daysLeft: number
}

export function isExpiryAlertStatus(status: string): status is ExpiryAlertStatus {
  return EXPIRY_ALERT_STATUSES.some((alertStatus) => alertStatus === status)
}

export function expiryAlertTitle(status: ExpiryAlertStatus) {
  return { expired: 'Périmé', soon: 'Bientôt', check: 'À vérifier' }[status]
}

/**
 * Alerts grouped by status, most urgent first, each group by date.
 */
export function groupExpiryAlerts(alerts: ExpiryAlert[]) {
  return EXPIRY_ALERT_STATUSES.map((status) => ({
    status,
    alerts: alerts
      .filter((alert) => alert.status === status)
      .toSorted((a, b) => a.expiresOn.localeCompare(b.expiresOn)),
  })).filter((group) => group.alerts.length > 0)
}

/**
 * Names the most urgent batch and counts the others.
 */
export function expiryDigestHeadline(alerts: ExpiryAlert[]) {
  const [first] = groupExpiryAlerts(alerts)[0].alerts
  const others = alerts.length - 1

  if (others === 0) {
    return `${first.ingredientName} à surveiller`
  }

  return `${first.ingredientName} et ${others} ${others > 1 ? 'autres produits' : 'autre produit'} à surveiller`
}

export function expiryDigestSummary(alerts: ExpiryAlert[]) {
  return groupExpiryAlerts(alerts)
    .map((group) => `${group.alerts.length} ${expiryAlertTitle(group.status).toLowerCase()}`)
    .join(', ')
}

/**
 * A batch is mailed again once its status or its date changes.
 */
export function noticeKey(notice: { status: string; expiresOn: string }) {
  return `${notice.status}:${notice.expiresOn}`
}

import type { ExpiryKind, IngredientUnit } from '#inventory/domain/catalog'

export type ExpiryAlertStatus = 'expired' | 'soon' | 'check'

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
  return status === 'expired' || status === 'soon' || status === 'check'
}

/**
 * A batch is mailed again once its status or its date changes.
 */
export function noticeKey(notice: { status: string; expiresOn: string }) {
  return `${notice.status}:${notice.expiresOn}`
}

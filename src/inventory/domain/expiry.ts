import { err, ok, type Result } from '#core/result'
import {
  INGREDIENT_CATEGORIES,
  isExpiryKind,
  type ExpiryKind,
  type IngredientCategory,
  type IngredientState,
} from '#inventory/domain/catalog'

/**
 * A calendar date, `YYYY-MM-DD`, with no time nor time zone.
 */
export interface Expiry {
  on: string
  kind: ExpiryKind
}

/**
 * `check` is a best before date already passed: still edible, worth a look.
 */
export type ExpiryStatus = 'expired' | 'soon' | 'check' | 'ok' | 'none'

export interface InvalidExpiryDateError {
  type: 'invalid_expiry_date'
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const DAY_IN_MILLISECONDS = 86_400_000
const URGENCY = { expired: 4, soon: 3, check: 2, ok: 1, none: 0 } satisfies Record<
  ExpiryStatus,
  number
>

/**
 * Dates are read in the kitchen's time zone: a batch expires at midnight
 * in Paris, whatever the server clock says.
 */
const calendar = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' })

export function validateExpiryDate(value: string): Result<string, InvalidExpiryDateError> {
  const time = Date.parse(value)
  const valid =
    ISO_DATE.test(value) && !Number.isNaN(time) && new Date(time).toISOString().startsWith(value)
  return valid ? ok(value) : err({ type: 'invalid_expiry_date' })
}

export function today(at = new Date()) {
  return calendar.format(at)
}

export function daysUntil(on: string, from: string) {
  return Math.round((Date.parse(on) - Date.parse(from)) / DAY_IN_MILLISECONDS)
}

interface ExpiryContext {
  category: IngredientCategory
  state: IngredientState
  today: string
}

/**
 * Freezing suspends expiry the way it suspends perishability.
 */
export function expiryStatus(expiry: Expiry | null, context: ExpiryContext): ExpiryStatus {
  if (!expiry || context.state === 'frozen') {
    return 'none'
  }

  const daysLeft = daysUntil(expiry.on, context.today)

  if (daysLeft < 0) {
    return expiry.kind === 'use_by' ? 'expired' : 'check'
  }

  return daysLeft <= INGREDIENT_CATEGORIES[context.category].expiryWarningDays ? 'soon' : 'ok'
}

export function isMoreUrgent(status: ExpiryStatus, than: ExpiryStatus) {
  return URGENCY[status] > URGENCY[than]
}

interface ExpiryRecord {
  id: string
  expires_on: string | null
  expiry_kind: string | null
}

/**
 * Narrows the expiry columns of a batch: a kind outside the catalog, or a
 * date without its kind, is corrupt data.
 */
export function parseExpiry({
  id,
  expires_on: on,
  expiry_kind: kind,
}: ExpiryRecord): Expiry | null {
  if (on === null && kind === null) {
    return null
  }

  if (on === null || kind === null || !isExpiryKind(kind)) {
    throw new Error(`Invalid expiry persisted for batch ${id}`)
  }

  return { on, kind }
}

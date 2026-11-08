import { createId } from '@paralleldrive/cuid2'
import { Entity } from '#core/domain/entity'
import { err, ok, type Result } from '#core/result'
import {
  INGREDIENT_CATEGORIES,
  type ExpiryKind,
  type IngredientCategory,
  type IngredientState,
  type IngredientUnit,
} from '#inventory/domain/catalog'
import {
  validateExpiryDate,
  type Expiry,
  type InvalidExpiryDateError,
} from '#inventory/domain/expiry'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { IngredientIdentifier } from '#inventory/domain/ingredient_identifier'

/**
 * A part of the stock bought together, sharing one expiry date or none.
 * Its quantity is in the unit of its ingredient.
 */
export interface IngredientBatchProperties {
  id: string
  quantity: number
  expiry: Expiry | null
  createdAt: Date
}

interface IngredientProperties {
  id: IngredientIdentifier
  userId: UserIdentifier
  name: string
  unit: IngredientUnit
  category: IngredientCategory
  state: IngredientState
  batches: IngredientBatchProperties[]
  createdAt: Date
  updatedAt: Date
}

export type IngredientChanges = Partial<
  Pick<IngredientProperties, 'name' | 'unit' | 'category' | 'state'>
>

/**
 * Without a kind, a new date takes the default kind of the category.
 */
export interface BatchInput {
  quantity: number
  expiresOn?: string | null
  expiryKind?: ExpiryKind
}

export type BatchChanges = Partial<BatchInput>

interface InvalidNameError {
  type: 'invalid_name'
}
interface InvalidQuantityError {
  type: 'invalid_quantity'
}
export type InvalidIngredientError =
  | InvalidNameError
  | InvalidQuantityError
  | InvalidExpiryDateError

export interface IngredientNotFoundError {
  type: 'ingredient_not_found'
}

export interface BatchNotFoundError {
  type: 'batch_not_found'
}

/**
 * Below this, what floating point subtraction leaves of a batch is dust.
 */
const EMPTY_BATCH = 1e-9

export function validateName(value: string): Result<string, InvalidNameError> {
  const name = value.trim()
  return name.length > 0 && name.length <= 100 ? ok(name) : err({ type: 'invalid_name' })
}

export function validateQuantity(value: number): Result<number, InvalidQuantityError> {
  return Number.isFinite(value) && value >= 0 ? ok(value) : err({ type: 'invalid_quantity' })
}

/**
 * A batch holds something: its quantity is strictly positive.
 */
export function validateBatch<TBatch extends BatchChanges>(
  batch: TBatch
): Result<TBatch, InvalidQuantityError | InvalidExpiryDateError> {
  if (batch.quantity !== undefined && !(Number.isFinite(batch.quantity) && batch.quantity > 0)) {
    return err({ type: 'invalid_quantity' })
  }

  if (batch.expiresOn && !validateExpiryDate(batch.expiresOn).ok) {
    return err({ type: 'invalid_expiry_date' })
  }

  return ok(batch)
}

/**
 * First expired, first out: dated batches by date, undated ones last, the
 * oldest first among equals.
 */
function byExpiry(a: IngredientBatchProperties, b: IngredientBatchProperties) {
  if (a.expiry?.on !== b.expiry?.on) {
    if (!a.expiry) {
      return 1
    }

    if (!b.expiry) {
      return -1
    }

    return a.expiry.on < b.expiry.on ? -1 : 1
  }

  return a.createdAt.getTime() - b.createdAt.getTime()
}

function sameExpiry(a: Expiry | null, b: Expiry | null) {
  return a?.on === b?.on && a?.kind === b?.kind
}

export class Ingredient extends Entity<IngredientProperties> {
  get id() {
    return this.getIdentifier().toString()
  }

  get userId() {
    return this.props.userId
  }

  get name() {
    return this.props.name
  }

  get quantity() {
    return this.props.batches.reduce((total, batch) => total + batch.quantity, 0)
  }

  get unit() {
    return this.props.unit
  }

  get category() {
    return this.props.category
  }

  get state() {
    return this.props.state
  }

  /**
   * In consumption order.
   */
  get batches() {
    return this.props.batches.toSorted(byExpiry)
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(properties: IngredientProperties) {
    return new Ingredient(properties)
  }

  /**
   * A new entity carrying the changes: the stored one stays untouched
   * until the repository persists the result.
   */
  with(changes: IngredientChanges, at: Date) {
    return new Ingredient({ ...this.props, ...changes, updatedAt: at })
  }

  /**
   * Quantities never go below zero: consuming more than the stock
   * leaves an empty shelf, not a debt. What is taken comes out of the
   * batches that expire first; what is added joins the latest batch.
   */
  adjustedBy(delta: number, at: Date) {
    return delta < 0 ? this.#consumed(-delta, at) : this.#restocked(delta, at)
  }

  withQuantity(quantity: number, at: Date) {
    return this.adjustedBy(quantity - this.quantity, at)
  }

  /**
   * A batch with the same expiry as an existing one joins it.
   */
  withBatch(input: BatchInput, at: Date) {
    const expiry = this.#expiryOf(input, null)
    const twin = this.props.batches.find((batch) => sameExpiry(batch.expiry, expiry))

    if (twin) {
      return this.#withBatches(
        this.props.batches.map((batch) =>
          batch === twin ? { ...batch, quantity: batch.quantity + input.quantity } : batch
        ),
        at
      )
    }

    return this.#withBatches(
      [...this.props.batches, { id: createId(), quantity: input.quantity, expiry, createdAt: at }],
      at
    )
  }

  withBatchChanges(
    batchId: string,
    changes: BatchChanges,
    at: Date
  ): Result<Ingredient, BatchNotFoundError> {
    const target = this.props.batches.find((batch) => batch.id === batchId)

    if (!target) {
      return err({ type: 'batch_not_found' })
    }

    const changed = {
      ...target,
      quantity: changes.quantity ?? target.quantity,
      expiry: this.#expiryOf(changes, target.expiry),
    }

    return ok(
      this.#withBatches(
        this.props.batches.map((batch) => (batch === target ? changed : batch)),
        at
      )
    )
  }

  withoutBatch(batchId: string, at: Date): Result<Ingredient, BatchNotFoundError> {
    if (!this.props.batches.some((batch) => batch.id === batchId)) {
      return err({ type: 'batch_not_found' })
    }

    return ok(
      this.#withBatches(
        this.props.batches.filter((batch) => batch.id !== batchId),
        at
      )
    )
  }

  #consumed(amount: number, at: Date) {
    let left = amount
    const batches: IngredientBatchProperties[] = []

    for (const batch of this.batches) {
      const taken = Math.min(left, batch.quantity)
      left -= taken

      if (batch.quantity - taken > EMPTY_BATCH) {
        batches.push({ ...batch, quantity: batch.quantity - taken })
      }
    }

    return this.#withBatches(batches, at)
  }

  #restocked(amount: number, at: Date) {
    if (amount === 0) {
      return this.#withBatches(this.props.batches, at)
    }

    const latest = this.props.batches.reduce<IngredientBatchProperties | null>(
      (newest, batch) => (newest && newest.createdAt >= batch.createdAt ? newest : batch),
      null
    )

    if (!latest) {
      return this.withBatch({ quantity: amount }, at)
    }

    return this.#withBatches(
      this.props.batches.map((batch) =>
        batch === latest ? { ...batch, quantity: batch.quantity + amount } : batch
      ),
      at
    )
  }

  #expiryOf(changes: BatchChanges, current: Expiry | null): Expiry | null {
    if (changes.expiresOn === null) {
      return null
    }

    const kind =
      changes.expiryKind ??
      current?.kind ??
      INGREDIENT_CATEGORIES[this.props.category].defaultExpiryKind

    if (changes.expiresOn !== undefined) {
      return { on: changes.expiresOn, kind }
    }

    return current && { on: current.on, kind }
  }

  #withBatches(batches: IngredientBatchProperties[], at: Date) {
    return new Ingredient({ ...this.props, batches, updatedAt: at })
  }
}

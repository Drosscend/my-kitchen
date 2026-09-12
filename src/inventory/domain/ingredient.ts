import { Entity } from '#core/domain/entity'
import { err, ok, type Result } from '#core/result'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { IngredientCategory, IngredientState, IngredientUnit } from '#inventory/domain/catalog'
import type { IngredientIdentifier } from '#inventory/domain/ingredient_identifier'

interface IngredientProperties {
  id: IngredientIdentifier
  userId: UserIdentifier
  name: string
  quantity: number
  unit: IngredientUnit
  category: IngredientCategory
  state: IngredientState
  createdAt: Date
  updatedAt: Date
}

export type IngredientChanges = Partial<
  Pick<IngredientProperties, 'name' | 'quantity' | 'unit' | 'category' | 'state'>
>

interface InvalidNameError {
  type: 'invalid_name'
}
interface InvalidQuantityError {
  type: 'invalid_quantity'
}
export type InvalidIngredientError = InvalidNameError | InvalidQuantityError

export interface IngredientNotFoundError {
  type: 'ingredient_not_found'
}

export function validateName(value: string): Result<string, InvalidNameError> {
  const name = value.trim()
  return name.length > 0 && name.length <= 100 ? ok(name) : err({ type: 'invalid_name' })
}

export function validateQuantity(value: number): Result<number, InvalidQuantityError> {
  return Number.isFinite(value) && value >= 0 ? ok(value) : err({ type: 'invalid_quantity' })
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
    return this.props.quantity
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
   * leaves an empty shelf, not a debt.
   */
  adjustedBy(delta: number, at: Date) {
    return this.with({ quantity: Math.max(0, this.props.quantity + delta) }, at)
  }
}

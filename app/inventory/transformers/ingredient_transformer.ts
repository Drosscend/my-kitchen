import { BaseTransformer } from '@adonisjs/core/transformers'
import type { IngredientView } from '#inventory/queries/inventory_query'

export default class IngredientTransformer extends BaseTransformer<IngredientView> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'quantity',
      'unit',
      'unitLabel',
      'category',
      'categoryLabel',
      'state',
      'stateLabel',
      'lowStock',
      'perishable',
      'updatedAt',
    ])
  }
}

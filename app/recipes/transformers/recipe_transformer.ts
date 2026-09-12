import { BaseTransformer } from '@adonisjs/core/transformers'
import type { RecipeView } from '#recipes/queries/recipe_query'

export default class RecipeTransformer extends BaseTransformer<RecipeView> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'title',
      'description',
      'baseServings',
      'notes',
      'ingredients',
      'steps',
    ])
  }
}

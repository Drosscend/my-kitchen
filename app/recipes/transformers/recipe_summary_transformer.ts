import { BaseTransformer } from '@adonisjs/core/transformers'
import type { RecipeSummary } from '#recipes/queries/recipe_library_query'

export default class RecipeSummaryTransformer extends BaseTransformer<RecipeSummary> {
  toObject() {
    return this.pick(this.resource, ['id', 'title', 'description', 'ingredientCount', 'stepCount'])
  }
}

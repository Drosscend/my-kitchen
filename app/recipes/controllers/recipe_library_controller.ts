import { inject } from '@adonisjs/core'
import RecipeSummaryTransformer from '#app/recipes/transformers/recipe_summary_transformer'
import { RecipeLibraryQuery } from '#recipes/queries/recipe_library_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RecipeLibraryController {
  constructor(private readonly library: RecipeLibraryQuery) {}

  async render({ auth, inertia }: HttpContext) {
    const recipes = await this.library.execute(auth.getUserOrFail().getIdentifier())

    return inertia.render('recipes/index', {
      recipes: RecipeSummaryTransformer.transform(recipes),
    })
  }
}

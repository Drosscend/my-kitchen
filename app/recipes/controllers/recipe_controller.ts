import { inject } from '@adonisjs/core'
import RecipeTransformer from '#app/recipes/transformers/recipe_transformer'
import { RecipeQuery } from '#recipes/queries/recipe_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RecipeController {
  constructor(private readonly recipe: RecipeQuery) {}

  async render({ auth, inertia, params, response }: HttpContext) {
    const recipe = await this.recipe.execute(auth.getUserOrFail().getIdentifier(), params.id)

    if (!recipe) {
      response.status(404)
      return inertia.render('errors/not_found', {})
    }

    return inertia.render('recipes/show', { recipe: RecipeTransformer.transform(recipe) })
  }
}

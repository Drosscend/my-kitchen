import { inject } from '@adonisjs/core'
import { recipeErrorMessages } from '#app/recipes/error_messages'
import { DeleteRecipe } from '#recipes/actions/delete_recipe'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class DeleteRecipeController {
  constructor(private readonly deleteRecipe: DeleteRecipe) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.deleteRecipe.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
    })

    if (!result.ok) {
      session.flash('error', recipeErrorMessages[result.error.type])
    } else {
      session.flash('success', 'Recette supprimée')
    }

    return response.redirect().toRoute('recipes.index')
  }
}

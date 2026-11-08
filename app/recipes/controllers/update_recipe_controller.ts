import { inject } from '@adonisjs/core'
import { invalidRecipeMessage, recipeErrorMessages } from '#app/recipes/error_messages'
import { recipeValidator } from '#app/recipes/validators'
import { UpdateRecipe } from '#recipes/actions/update_recipe'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UpdateRecipeController {
  constructor(private readonly updateRecipe: UpdateRecipe) {}

  async execute({ request, response, auth, session, params }: HttpContext) {
    const content = await request.validateUsing(recipeValidator)
    const result = await this.updateRecipe.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
      content,
    })

    if (result.ok) {
      session.flash('success', 'Recette enregistrée')
      return response.redirect().toRoute('recipes.show', { id: params.id })
    }

    if (result.error.type === 'recipe_not_found') {
      session.flash('error', recipeErrorMessages.recipe_not_found)
      return response.redirect().toRoute('recipes.index')
    }

    session.flash('error', invalidRecipeMessage(result.error))
    return response.redirect().back()
  }
}

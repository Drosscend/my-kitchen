import { inject } from '@adonisjs/core'
import { invalidRecipeMessage } from '#app/recipes/error_messages'
import { recipeValidator } from '#app/recipes/validators'
import { AddRecipe } from '#recipes/actions/add_recipe'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AddRecipeController {
  constructor(private readonly addRecipe: AddRecipe) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const content = await request.validateUsing(recipeValidator)
    const result = await this.addRecipe.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      content,
    })

    if (!result.ok) {
      session.flash('error', invalidRecipeMessage(result.error))
      return response.redirect().back()
    }

    session.flash('success', 'Recette enregistrée')
    return response.redirect().toRoute('recipes.show', { id: result.value.id })
  }
}

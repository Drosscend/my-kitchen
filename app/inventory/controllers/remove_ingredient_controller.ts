import { inject } from '@adonisjs/core'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { RemoveIngredient } from '#inventory/actions/remove_ingredient'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RemoveIngredientController {
  constructor(private readonly removeIngredient: RemoveIngredient) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.removeIngredient.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
    }

    return response.redirect().toRoute('inventory.index')
  }
}

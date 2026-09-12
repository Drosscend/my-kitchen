import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { ingredientFields } from '#app/inventory/validators'
import { AddIngredient } from '#inventory/actions/add_ingredient'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AddIngredientController {
  static readonly validator = vine.create(ingredientFields)

  constructor(private readonly addIngredient: AddIngredient) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(AddIngredientController.validator)
    const result = await this.addIngredient.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      ...params,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
    }

    return response.redirect().toRoute('inventory.index')
  }
}

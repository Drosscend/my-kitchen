import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { ingredientFields } from '#app/inventory/validators'
import { UpdateIngredient } from '#inventory/actions/update_ingredient'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UpdateIngredientController {
  static readonly validator = vine.create({
    name: ingredientFields.name.optional(),
    quantity: ingredientFields.quantity.optional(),
    unit: ingredientFields.unit.optional(),
    category: ingredientFields.category.optional(),
    state: ingredientFields.state.optional(),
  })

  constructor(private readonly updateIngredient: UpdateIngredient) {}

  async execute({ request, response, auth, session, params }: HttpContext) {
    const changes = await request.validateUsing(UpdateIngredientController.validator)
    const result = await this.updateIngredient.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
      changes,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
    }

    return response.redirect().toRoute('inventory.index')
  }
}

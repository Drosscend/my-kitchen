import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { AdjustIngredientQuantity } from '#inventory/actions/adjust_ingredient_quantity'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AdjustIngredientQuantityController {
  static readonly validator = vine.create({
    delta: vine.number(),
  })

  constructor(private readonly adjustIngredientQuantity: AdjustIngredientQuantity) {}

  async execute({ request, response, auth, session, params }: HttpContext) {
    const { delta } = await request.validateUsing(AdjustIngredientQuantityController.validator)
    const result = await this.adjustIngredientQuantity.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
      delta,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
    }

    return response.redirect().toRoute('inventory.index')
  }
}

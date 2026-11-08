import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { expiryFields } from '#app/inventory/validators'
import { AddIngredientBatch } from '#inventory/actions/add_ingredient_batch'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AddIngredientBatchController {
  static readonly validator = vine.create({
    quantity: vine.number().positive(),
    ...expiryFields,
  })

  constructor(private readonly addIngredientBatch: AddIngredientBatch) {}

  async execute({ request, response, auth, session, params }: HttpContext) {
    const batch = await request.validateUsing(AddIngredientBatchController.validator)
    const result = await this.addIngredientBatch.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
      batch,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
    }

    return response.redirect().toRoute('inventory.index')
  }
}
